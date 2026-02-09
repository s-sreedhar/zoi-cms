import * as migration_20260208_135414_initial_schema from './20260208_135414_initial_schema';
import * as migration_20260209_000001_sync_production_schema from './20260209_000001_sync_production_schema';
import * as migration_20260209_000002_full_schema_reconstruction from './20260209_000002_full_schema_reconstruction';
import * as migration_20260209_000003_complete_schema_reconstruction from './20260209_000003_complete_schema_reconstruction';
import * as migration_20260209_000004_absolute_schema_sync from './20260209_000004_absolute_schema_sync';
import * as migration_20260209_000005_deep_column_sync from './20260209_000005_deep_column_sync';
import * as migration_20260209_181202 from './20260209_181202';

export const migrations = [
  {
    up: migration_20260208_135414_initial_schema.up,
    down: migration_20260208_135414_initial_schema.down,
    name: '20260208_135414_initial_schema',
  },
  {
    up: migration_20260209_000001_sync_production_schema.up,
    down: migration_20260209_000001_sync_production_schema.down,
    name: '20260209_000001_sync_production_schema',
  },
  {
    up: migration_20260209_000002_full_schema_reconstruction.up,
    down: migration_20260209_000002_full_schema_reconstruction.down,
    name: '20260209_000002_full_schema_reconstruction',
  },
  {
    up: migration_20260209_000003_complete_schema_reconstruction.up,
    down: migration_20260209_000003_complete_schema_reconstruction.down,
    name: '20260209_000003_complete_schema_reconstruction',
  },
  {
    up: migration_20260209_000004_absolute_schema_sync.up,
    down: migration_20260209_000004_absolute_schema_sync.down,
    name: '20260209_000004_absolute_schema_sync',
  },
  {
    up: migration_20260209_000005_deep_column_sync.up,
    down: migration_20260209_000005_deep_column_sync.down,
    name: '20260209_000005_deep_column_sync',
  },
  {
    up: migration_20260209_181202.up,
    down: migration_20260209_181202.down,
    name: '20260209_181202'
  },
];
