import * as migration_20260208_061247_initial from './20260208_061247_initial';

export const migrations = [
  {
    up: migration_20260208_061247_initial.up,
    down: migration_20260208_061247_initial.down,
    name: '20260208_061247_initial'
  },
];
