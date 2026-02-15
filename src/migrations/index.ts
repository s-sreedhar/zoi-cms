import * as migration_20260214_000000_consolidated_state from './20260214_000000_consolidated_state';
import * as migration_20260215_150000_schema_v2 from './20260215_150000_schema_v2';

export const migrations = [
  {
    up: migration_20260214_000000_consolidated_state.up,
    down: migration_20260214_000000_consolidated_state.down,
    name: '20260214_000000_consolidated_state',
  },
  {
    up: migration_20260215_150000_schema_v2.up,
    down: migration_20260215_150000_schema_v2.down,
    name: '20260215_150000_schema_v2',
  },
];
