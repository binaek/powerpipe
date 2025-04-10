package dashboardexecute

import (
	"context"
	"fmt"
	"github.com/turbot/pipe-fittings/v2/modconfig"
	"github.com/turbot/pipe-fittings/v2/steampipeconfig"
	"github.com/turbot/powerpipe/internal/dashboardevents"
	"github.com/turbot/powerpipe/internal/workspace"
)

func GenerateSnapshot(ctx context.Context, w *workspace.PowerpipeWorkspace, rootResource modconfig.ModTreeItem, inputs *InputValues) (snapshot *steampipeconfig.SteampipeSnapshot, err error) {
	// no session for manual execution
	sessionId := ""
	errorChannel := make(chan error)
	resultChannel := make(chan *steampipeconfig.SteampipeSnapshot)
	dashboardEventHandler := func(ctx context.Context, event dashboardevents.DashboardEvent) {
		handleDashboardEvent(ctx, event, resultChannel, errorChannel)
	}
	w.RegisterDashboardEventHandler(ctx, dashboardEventHandler)
	// clear event handlers again in case another snapshot will be generated in this run
	defer w.UnregisterDashboardEventHandlers()

	// all runtime dependencies must be resolved before execution (i.e. inputs must be passed in)
	Executor.interactive = false

	if err := Executor.ExecuteDashboard(ctx, sessionId, rootResource, inputs, w); err != nil {
		return nil, err
	}

	select {
	case err = <-errorChannel:
		return nil, err
	case snapshot = <-resultChannel:
		// set the filename root of the snapshot
		fileRootName := rootResource.Name()

		// if the root resource has no corresponding filename, this must be a query snapshot - update the filename root
		if rootResource.GetDeclRange().Filename == "" {
			fileRootName = rootResource.GetBlockType()
		}

		snapshot.FileNameRoot = fileRootName
		//  return the context error (if any) to ensure we respect cancellation
		return snapshot, ctx.Err()
	}
}

func handleDashboardEvent(_ context.Context, event dashboardevents.DashboardEvent, resultChannel chan *steampipeconfig.SteampipeSnapshot, errorChannel chan error) {
	switch e := event.(type) {
	case *dashboardevents.ExecutionError:
		errorChannel <- e.Error
	case *dashboardevents.ExecutionComplete:
		snap := ExecutionCompleteToSnapshot(e)
		resultChannel <- snap
	}
}

// ExecutionCompleteToSnapshot transforms the ExecutionComplete event into a SteampipeSnapshot
func ExecutionCompleteToSnapshot(event *dashboardevents.ExecutionComplete) *steampipeconfig.SteampipeSnapshot {
	metadata := make(map[string]interface{})
	if !event.DateTimeRange.Empty() {
		metadata["datetime_range"] = event.DateTimeRange
	}
	if event.SearchPathPrefix != nil {
		metadata["search_path_prefix"] = event.SearchPathPrefix
	}

	return &steampipeconfig.SteampipeSnapshot{
		SchemaVersion: fmt.Sprintf("%d", steampipeconfig.SteampipeSnapshotSchemaVersion),
		Panels:        event.Panels,
		Layout:        event.Root.AsTreeNode(),
		Inputs:        event.Inputs,
		Variables:     event.Variables,
		SearchPath:    event.SearchPath,
		StartTime:     event.StartTime,
		EndTime:       event.EndTime,
		Title:         event.Root.GetTitle(),
		Metadata:      metadata,
	}
}
