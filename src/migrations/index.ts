import * as migration_20260210_000000_master from './20260210_000000_master';
import * as migration_20260210_122125_fix_lesson_schema_debug_v3 from './20260210_122125_fix_lesson_schema_debug_v3';
import * as migration_20260210_122731_fix_missing_collections from './20260210_122731_fix_missing_collections';
import * as migration_20260210_180420_safe from './20260210_180420_safe';
import * as migration_20260211_155246_add_google_auth_fields from './20260211_155246_add_google_auth_fields';
import * as migration_20260211_180430_add_streak_field from './20260211_180430_add_streak_field';
import * as migration_20260213_192902 from './20260213_192902';
import * as migration_20260213_195615 from './20260213_195615';
import * as migration_20260213_201538 from './20260213_201538';
import * as migration_20260214_fix_lexical_format from './20260214_fix_lexical_format';

export const migrations = [
  {
    up: migration_20260210_000000_master.up,
    down: migration_20260210_000000_master.down,
    name: '20260210_000000_master',
  },
  {
    up: migration_20260210_122125_fix_lesson_schema_debug_v3.up,
    down: migration_20260210_122125_fix_lesson_schema_debug_v3.down,
    name: '20260210_122125_fix_lesson_schema_debug_v3',
  },
  {
    up: migration_20260210_122731_fix_missing_collections.up,
    down: migration_20260210_122731_fix_missing_collections.down,
    name: '20260210_122731_fix_missing_collections',
  },
  {
    up: migration_20260210_180420_safe.up,
    down: migration_20260210_180420_safe.down,
    name: '20260210_180420_safe',
  },
  {
    up: migration_20260211_155246_add_google_auth_fields.up,
    down: migration_20260211_155246_add_google_auth_fields.down,
    name: '20260211_155246_add_google_auth_fields',
  },
  {
    up: migration_20260211_180430_add_streak_field.up,
    down: migration_20260211_180430_add_streak_field.down,
    name: '20260211_180430_add_streak_field',
  },
  {
    up: migration_20260213_192902.up,
    down: migration_20260213_192902.down,
    name: '20260213_192902',
  },
  {
    up: migration_20260213_195615.up,
    down: migration_20260213_195615.down,
    name: '20260213_195615',
  },
  {
    up: migration_20260213_201538.up,
    down: migration_20260213_201538.down,
    name: '20260213_201538'
  },
  {
    up: migration_20260214_fix_lexical_format.up,
    down: migration_20260214_fix_lexical_format.down,
    name: '20260214_fix_lexical_format'
  },
];
