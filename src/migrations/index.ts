import * as migration_20260210_000000_master from './20260210_000000_master';

export const migrations = [
  {
    up: migration_20260210_000000_master.up,
    down: migration_20260210_000000_master.down,
    name: '20260210_000000_master',
  },
];
