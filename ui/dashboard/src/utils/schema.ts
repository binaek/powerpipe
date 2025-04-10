import {
  DashboardActions,
  DashboardExecutionCompleteEvent,
  DashboardExecutionEventWithSchema,
  DashboardExecutionStartedEvent,
  DashboardSnapshot,
  DashboardSnapshotViewMetadata,
} from "@powerpipe/types";
import {
  EXECUTION_COMPLETE_SCHEMA_VERSION_LATEST,
  EXECUTION_SCHEMA_VERSION_20220614,
  EXECUTION_SCHEMA_VERSION_20220929,
  EXECUTION_SCHEMA_VERSION_20221222,
  EXECUTION_SCHEMA_VERSION_20240130,
  EXECUTION_SCHEMA_VERSION_20240607,
  EXECUTION_SCHEMA_VERSION_20241125,
  EXECUTION_STARTED_SCHEMA_VERSION_LATEST,
} from "@powerpipe/constants/versions";
import { migratePanelStatuses } from "./dashboardEventHandlers";
import { KeyValuePairs } from "@powerpipe/components/dashboards/common/types";

const executedStartedMigrations = [
  {
    version: EXECUTION_SCHEMA_VERSION_20220614,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionStartedEvent {
      const {
        action,
        execution_id,
        inputs,
        layout,
        panels = {},
        variables,
      } = current;
      return {
        action,
        execution_id,
        inputs,
        layout,
        panels: migratePanelStatuses(panels, EXECUTION_SCHEMA_VERSION_20220614),
        variables,
        start_time: new Date().toISOString(),
        schema_version: EXECUTION_SCHEMA_VERSION_20221222,
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20221222,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionStartedEvent {
      return {
        ...(current as DashboardExecutionStartedEvent),
        schema_version: EXECUTION_SCHEMA_VERSION_20240130,
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240130,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionStartedEvent {
      return {
        ...(current as DashboardExecutionStartedEvent),
        schema_version: EXECUTION_SCHEMA_VERSION_20240607,
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240607,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionStartedEvent {
      // Nothing to do here as this event is already in the latest supported schema
      return {
        ...(current as DashboardExecutionStartedEvent),
        schema_version: EXECUTION_SCHEMA_VERSION_20241125,
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20241125,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionStartedEvent {
      // Nothing to do here as this event is already in the latest supported schema
      return {
        ...(current as DashboardExecutionStartedEvent),
        schema_version: EXECUTION_SCHEMA_VERSION_20241125,
      };
    },
  },
];

const executedCompletedMigrations = [
  {
    version: EXECUTION_SCHEMA_VERSION_20220614,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        action,
        execution_id,
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
      } = current;
      return {
        action,
        schema_version: EXECUTION_SCHEMA_VERSION_20220929,
        execution_id,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20220929,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20220929,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      // The shape is already correct - just need to bump the version
      const {
        action,
        execution_id,
        snapshot: { schema_version, panels = {}, ...snapshotRest },
      } = current;
      return {
        action,
        schema_version: EXECUTION_SCHEMA_VERSION_20240607,
        execution_id,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20240607,
          panels: migratePanelStatuses(
            panels,
            EXECUTION_SCHEMA_VERSION_20220929,
          ),
          ...snapshotRest,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20221222,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      // The shape is already correct - just need to bump the version
      const {
        action,
        execution_id,
        snapshot: { schema_version, panels = {}, ...snapshotRest },
      } = current;
      return {
        action,
        schema_version: EXECUTION_SCHEMA_VERSION_20240607,
        execution_id,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20240607,
          panels: migratePanelStatuses(
            panels,
            EXECUTION_SCHEMA_VERSION_20221222,
          ),
          ...snapshotRest,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240130,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      // The shape is already correct - just need to bump the version
      const {
        action,
        execution_id,
        snapshot: { schema_version, panels = {}, ...snapshotRest },
      } = current;
      return {
        action,
        schema_version: EXECUTION_SCHEMA_VERSION_20240607,
        execution_id,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20240607,
          panels: migratePanelStatuses(
            panels,
            EXECUTION_SCHEMA_VERSION_20240130,
          ),
          ...snapshotRest,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240607,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        action,
        execution_id,
        snapshot: {
          schema_version,
          layout,
          panels = {},
          metadata,
          ...snapshotRest
        },
      } = current;

      // We need to migrate the view metadata to the new format
      if (metadata) {
        let hasViewMetadata = false;
        const rootPanel = layout.name;
        const panelKeyedViewMetadata: KeyValuePairs<DashboardSnapshotViewMetadata> =
          { [rootPanel]: {} };
        if (metadata.view?.filter_by) {
          hasViewMetadata = true;
          panelKeyedViewMetadata[rootPanel].filter_by = metadata.view.filter_by;
        }
        if (metadata.view?.group_by) {
          hasViewMetadata = true;
          panelKeyedViewMetadata[rootPanel].group_by = metadata.view.group_by;
        }
        if (hasViewMetadata) {
          metadata.view = panelKeyedViewMetadata;
        }
      }

      const newPayload = {
        action,
        schema_version: EXECUTION_SCHEMA_VERSION_20241125,
        execution_id,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20241125,
          layout,
          panels: migratePanelStatuses(
            panels,
            EXECUTION_SCHEMA_VERSION_20240607,
          ),
          ...snapshotRest,
        },
      };

      if (metadata) {
        newPayload.snapshot.metadata = metadata;
      }

      return newPayload;
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20241125,
    up: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      // Nothing to do here as this event is already in the latest supported schema
      return current as DashboardExecutionCompleteEvent;
    },
  },
];

const snapshotDataToExecutionCompleteMigrations = [
  {
    version: EXECUTION_SCHEMA_VERSION_20220614,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20220614,
        // @ts-ignore
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20220929,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20220929,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20220929,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20221222,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20221222,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20221222,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240130,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
        metadata,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20240130,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20240130,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
          metadata,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20240607,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
        metadata,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20240607,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20240607,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
          metadata,
        },
      };
    },
  },
  {
    version: EXECUTION_SCHEMA_VERSION_20241125,
    toExecutionComplete: function (
      current: DashboardExecutionEventWithSchema,
    ): DashboardExecutionCompleteEvent {
      const {
        layout,
        panels,
        inputs,
        variables,
        search_path,
        start_time,
        end_time,
        metadata,
      } = current;
      return {
        action: DashboardActions.EXECUTION_COMPLETE,
        execution_id: "",
        schema_version: EXECUTION_SCHEMA_VERSION_20241125,
        snapshot: {
          schema_version: EXECUTION_SCHEMA_VERSION_20241125,
          layout,
          panels,
          inputs,
          variables,
          search_path,
          start_time,
          end_time,
          metadata,
        },
      };
    },
  },
];

const executionStartedVersionMigratorIndexLookup = {};
for (const [index, migrator] of executedStartedMigrations.entries()) {
  executionStartedVersionMigratorIndexLookup[migrator.version] = index;
}

const executionCompleteVersionMigratorIndexLookup = {};
for (const [index, migrator] of executedCompletedMigrations.entries()) {
  executionCompleteVersionMigratorIndexLookup[migrator.version] = index;
}

const snapshotDataToExecutionCompleteVersionMigratorIndexLookup = {};
for (const [
  index,
  migrator,
] of snapshotDataToExecutionCompleteMigrations.entries()) {
  snapshotDataToExecutionCompleteVersionMigratorIndexLookup[migrator.version] =
    index;
}

class ExecutionStartedSchemaMigrator {
  toLatest(
    current: DashboardExecutionEventWithSchema,
  ): DashboardExecutionStartedEvent {
    if (current.schema_version === EXECUTION_STARTED_SCHEMA_VERSION_LATEST) {
      return current as DashboardExecutionStartedEvent;
    }
    const startingIndex =
      executionStartedVersionMigratorIndexLookup[current.schema_version];
    if (startingIndex === undefined) {
      throw new Error(
        `Unsupported dashboard event schema ${current.schema_version}`,
      );
    }
    let migrated = current;
    for (
      let idx = startingIndex;
      idx < executedStartedMigrations.length;
      idx++
    ) {
      const migrator = executedStartedMigrations[idx];
      migrated = migrator.up(migrated);
    }
    return migrated as DashboardExecutionStartedEvent;
  }
}

class ExecutionCompleteSchemaMigrator {
  toLatest(
    current: DashboardExecutionEventWithSchema,
  ): DashboardExecutionCompleteEvent {
    if (current.schema_version === EXECUTION_COMPLETE_SCHEMA_VERSION_LATEST) {
      return current as DashboardExecutionCompleteEvent;
    }
    const startingIndex =
      executionCompleteVersionMigratorIndexLookup[current.schema_version];
    if (startingIndex === undefined) {
      throw new Error(
        `Unsupported dashboard event schema ${current.schema_version}`,
      );
    }
    let migrated = current;
    for (
      let idx = startingIndex;
      idx < executedCompletedMigrations.length;
      idx++
    ) {
      const migrator = executedCompletedMigrations[idx];
      migrated = migrator.up(migrated);
    }
    return migrated as DashboardExecutionCompleteEvent;
  }
}

class SnapshotDataToExecutionCompleteSchemaMigrator {
  toLatest(current: DashboardSnapshot): DashboardExecutionCompleteEvent {
    const migratorIndex =
      snapshotDataToExecutionCompleteVersionMigratorIndexLookup[
        current.schema_version
      ];
    if (migratorIndex === undefined) {
      throw new Error(
        `Unsupported dashboard event schema ${current.schema_version}`,
      );
    }
    const snapshotMigrator =
      snapshotDataToExecutionCompleteMigrations[migratorIndex];
    const executionCompleteEvent =
      snapshotMigrator.toExecutionComplete(current);
    const executionCompleteEventMigrator =
      new ExecutionCompleteSchemaMigrator();
    return executionCompleteEventMigrator.toLatest(executionCompleteEvent);
  }
}

export {
  ExecutionStartedSchemaMigrator,
  ExecutionCompleteSchemaMigrator,
  SnapshotDataToExecutionCompleteSchemaMigrator,
};
