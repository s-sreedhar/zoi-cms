import * as migration_20260214_000000_consolidated_state from './20260214_000000_consolidated_state';

export const migrations = [
  {
    up: migration_20260214_000000_consolidated_state.up,
    down: migration_20260214_000000_consolidated_state.down,
    name: '20260214_000000_consolidated_state'
  },
];
