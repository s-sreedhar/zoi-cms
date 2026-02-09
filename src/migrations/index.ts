import * as migration_20260208_135414_initial_schema from './20260208_135414_initial_schema';
import * as migration_20260209_000001_sync_production_schema from './20260209_000001_sync_production_schema';

export const migrations = [
  {
    up: migration_20260208_135414_initial_schema.up,
    down: migration_20260208_135414_initial_schema.down,
    name: '20260208_135414_initial_schema'
  },
  {
    up: migration_20260209_000001_sync_production_schema.up,
    down: migration_20260209_000001_sync_production_schema.down,
    name: '20260209_000001_sync_production_schema'
  },
];
