package dashboardserver

import (
	"fmt"
	"time"

	"github.com/turbot/pipe-fittings/v2/steampipeconfig"
	"github.com/turbot/pipe-fittings/v2/utils"
	"github.com/turbot/powerpipe/internal/controlstatus"
	"github.com/turbot/powerpipe/internal/dashboardexecute"
	"gopkg.in/olahol/melody.v1"
)

type ListenType string

const (
	ListenTypeLocal            ListenType = "local"
	ListenTypeNetwork          ListenType = "network"
	DashboardServerDefaultPort int        = 9033
)

// IsValid is a validator for ListenType known values
func (lt ListenType) IsValid() error {
	switch lt {
	case ListenTypeNetwork, ListenTypeLocal:
		return nil
	}
	return fmt.Errorf("invalid listen type: %v. Must be one of '%v' or '%v'", lt, ListenTypeNetwork, ListenTypeLocal)
}

type ListenPort int

// IsValid is a validator for ListenType known values
func (lp ListenPort) IsValid() error {
	if lp < 1 || lp > 65535 {
		return fmt.Errorf("invalid port - must be within range (1:65535)")
	}
	return nil
}

type ErrorPayload struct {
	Action string `json:"action"`
	Error  string `json:"error"`
}

var ExecutionStartedSchemaVersion int64 = 20240607

type ExecutionStartedPayload struct {
	SchemaVersion string                            `json:"schema_version"`
	Action        string                            `json:"action"`
	ExecutionId   string                            `json:"execution_id"`
	Panels        map[string]any                    `json:"panels"`
	Layout        *steampipeconfig.SnapshotTreeNode `json:"layout"`
	Inputs        map[string]interface{}            `json:"inputs,omitempty"`
	Variables     map[string]string                 `json:"variables,omitempty"`
	StartTime     time.Time                         `json:"start_time"`
}

var LeafNodeUpdatedSchemaVersion int64 = 20240607

type LeafNodeUpdatedPayload struct {
	SchemaVersion string         `json:"schema_version"`
	Action        string         `json:"action"`
	DashboardNode map[string]any `json:"dashboard_node"`
	ExecutionId   string         `json:"execution_id"`
	Timestamp     time.Time      `json:"timestamp"`
}

type ControlEventPayload struct {
	Action      string                                 `json:"action"`
	Control     controlstatus.ControlRunStatusProvider `json:"control"`
	Name        string                                 `json:"name"`
	Progress    *controlstatus.ControlProgress         `json:"progress"`
	ExecutionId string                                 `json:"execution_id"`
	Timestamp   time.Time                              `json:"timestamp"`
}

type ExecutionErrorPayload struct {
	Action    string    `json:"action"`
	Error     string    `json:"error"`
	Timestamp time.Time `json:"timestamp"`
}

var ExecutionCompletePayloadSchemaVersion int64 = 20240607

type ExecutionCompletePayload struct {
	Action        string                             `json:"action"`
	SchemaVersion string                             `json:"schema_version"`
	Snapshot      *steampipeconfig.SteampipeSnapshot `json:"snapshot"`
	ExecutionId   string                             `json:"execution_id"`
}

type DisplaySnapshotPayload struct {
	Action        string `json:"action"`
	SchemaVersion string `json:"schema_version"`
	// snapshot is a map here as we cannot deserialise SteampipeSnapshot into a struct
	// (without custom deserialisation code) as the Panels property is an interface
	Snapshot    map[string]any `json:"snapshot"`
	ExecutionId string         `json:"execution_id"`
}

type InputValuesClearedPayload struct {
	Action        string   `json:"action"`
	ClearedInputs []string `json:"cleared_inputs"`
	ExecutionId   string   `json:"execution_id"`
}

type DashboardClientInfo struct {
	Session         *melody.Session
	Dashboard       *string
	DashboardInputs *dashboardexecute.InputValues
}

type ClientRequestDashboardPayload struct {
	FullName string `json:"full_name"`
}

type ClientRequestPayload struct {
	Dashboard ClientRequestDashboardPayload `json:"dashboard"`

	Inputs        map[string]interface{} `json:"inputs"`
	DateTimeRange utils.TimeRange        `json:"datetime_range"`

	ChangedInput     string   `json:"changed_input"`
	SearchPath       []string `json:"search_path"`
	SearchPathPrefix []string `json:"search_path_prefix"`
}

func (p *ClientRequestPayload) InputValues() *dashboardexecute.InputValues {
	// construct input values from payload
	return &dashboardexecute.InputValues{
		Inputs:        p.Inputs,
		DateTimeRange: p.DateTimeRange,
	}
}

type ClientRequest struct {
	Action  string               `json:"action"`
	Payload ClientRequestPayload `json:"payload"`
}

type ModAvailableDashboard struct {
	Title       string            `json:"title,omitempty"`
	FullName    string            `json:"full_name"`
	ShortName   string            `json:"short_name"`
	Tags        map[string]string `json:"tags"`
	ModFullName string            `json:"mod_full_name"`
	Database    string            `json:"database"`
}

type ModAvailableBenchmark struct {
	Title         string                  `json:"title,omitempty"`
	FullName      string                  `json:"full_name"`
	ShortName     string                  `json:"short_name"`
	BenchmarkType string                  `json:"benchmark_type"`
	Tags          map[string]string       `json:"tags"`
	IsTopLevel    bool                    `json:"is_top_level"`
	Children      []ModAvailableBenchmark `json:"children,omitempty"`
	Trunks        [][]string              `json:"trunks"`
	ModFullName   string                  `json:"mod_full_name"`
}

// TODO KAI COORDINATE WITH MIKE

type AvailableDashboardsPayload struct {
	Action              string                           `json:"action"`
	Dashboards          map[string]ModAvailableDashboard `json:"dashboards"`
	Benchmarks          map[string]ModAvailableBenchmark `json:"benchmarks"`
	DetectionBenchmarks map[string]ModAvailableBenchmark `json:"detection_benchmarks"`
	Snapshots           map[string]string                `json:"snapshots"`
}

type ModMetadata struct {
	Title     string `json:"title,omitempty"`
	FullName  string `json:"full_name"`
	ShortName string `json:"short_name"`
}

type SearchPathMetadata struct {
	ResolvedSearchPath   []string `json:"resolved_search_path"`
	OriginalSearchPath   []string `json:"original_search_path"`
	ConfiguredSearchPath []string `json:"configured_search_path"`
	SearchPathPrefix     []string `json:"short_name"`
}

type DashboardMetadata struct {
	SupportsSearchPath bool `json:"supports_search_path"`
	SupportsTimeRange  bool `json:"supports_time_range"`
}

type DashboardCLIMetadata struct {
	Version string `json:"version,omitempty"`
}

type ServerMetadata struct {
	Mod                *ModMetadata                   `json:"mod,omitempty"`
	InstalledMods      map[string]*ModMetadata        `json:"installed_mods,omitempty"`
	CLI                DashboardCLIMetadata           `json:"cli"`
	Cloud              *steampipeconfig.PipesMetadata `json:"cloud,omitempty"`
	Telemetry          string                         `json:"telemetry"`
	SearchPath         *SearchPathMetadata            `json:"search_path"`
	SupportsSearchPath bool                           `json:"supports_search_path"`
	SupportsTimeRange  bool                           `json:"supports_time_range"`
}

type ServerMetadataPayload struct {
	Action   string         `json:"action"`
	Metadata ServerMetadata `json:"metadata"`
}
type DashboardMetadataPayload struct {
	Action   string            `json:"action"`
	Metadata DashboardMetadata `json:"metadata"`
}
