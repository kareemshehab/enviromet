import * as migration_20261015_123043_initial from './20261015_123043_initial';

export const migrations = [
  {
    up: migration_20261015_123043_initial.up,
    down: migration_20261015_123043_initial.down,
    name: '20261015_123043_initial'
  },
];
