import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    console.log('[MIGRATION] Fixing malformed Lexical JSON in existing data...')

    // This migration assumes the old broken migrations have already run
    // and the columns are already jsonb but with malformed data
    // We just need to fix the malformed jsonb data

    // Fix quizzes.description - convert malformed array format to proper Lexical format
    await db.execute(sql`
   UPDATE "quizzes" 
   SET "description" = jsonb_build_object(
     'root', jsonb_build_object(
       'type', 'root',
       'children', jsonb_build_array(
         jsonb_build_object(
           'type', 'paragraph',
           'children', jsonb_build_array(
             jsonb_build_object(
               'type', 'text',
               'text', COALESCE("description"->0->'children'->0->>'text', ''),
               'version', 1
             )
           ),
           'version', 1
         )
       ),
       'version', 1
     )
   )
   WHERE "description" IS NOT NULL 
     AND jsonb_typeof("description") = 'array'
     AND "description"->>'root' IS NULL`)

    console.log('[MIGRATION] ✓ Fixed quizzes.description')

    // Fix problems.template - convert malformed array format to proper Lexical format
    await db.execute(sql`
   UPDATE "problems" 
   SET "template" = jsonb_build_object(
     'root', jsonb_build_object(
       'type', 'root',
       'children', jsonb_build_array(
         jsonb_build_object(
           'type', 'paragraph',
           'children', jsonb_build_array(
             jsonb_build_object(
               'type', 'text',
               'text', COALESCE("template"->0->'children'->0->>'text', ''),
               'version', 1
             )
           ),
           'version', 1
         )
       ),
       'version', 1
     )
   )
   WHERE "template" IS NOT NULL 
     AND jsonb_typeof("template") = 'array'
     AND "template"->>'root' IS NULL`)

    console.log('[MIGRATION] ✓ Fixed problems.template')

    // Fix problems.testbench - convert malformed array format to proper Lexical format
    await db.execute(sql`
   UPDATE "problems" 
   SET "testbench" = jsonb_build_object(
     'root', jsonb_build_object(
       'type', 'root',
       'children', jsonb_build_array(
         jsonb_build_object(
           'type', 'paragraph',
           'children', jsonb_build_array(
             jsonb_build_object(
               'type', 'text',
               'text', COALESCE("testbench"->0->'children'->0->>'text', ''),
               'version', 1
             )
           ),
           'version', 1
         )
       ),
       'version', 1
     )
   )
   WHERE "testbench" IS NOT NULL 
     AND jsonb_typeof("testbench") = 'array'
     AND "testbench"->>'root' IS NULL`)

    console.log('[MIGRATION] ✓ Fixed problems.testbench')

    // Fix lesson_notes.content - convert malformed array format to proper Lexical format
    await db.execute(sql`
   UPDATE "lesson_notes" 
   SET "content" = jsonb_build_object(
     'root', jsonb_build_object(
       'type', 'root',
       'children', jsonb_build_array(
         jsonb_build_object(
           'type', 'paragraph',
           'children', jsonb_build_array(
             jsonb_build_object(
               'type', 'text',
               'text', COALESCE("content"->0->'children'->0->>'text', ''),
               'version', 1
             )
           ),
           'version', 1
         )
       ),
       'version', 1
     )
   )
   WHERE "content" IS NOT NULL 
     AND jsonb_typeof("content") = 'array'
     AND "content"->>'root' IS NULL`)

    console.log('[MIGRATION] ✓ Fixed lesson_notes.content')
    console.log('[MIGRATION] ✅ All malformed Lexical JSON fixed successfully')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    console.log('[MIGRATION] Rolling back Lexical JSON fixes...')

    // Revert to malformed array format
    await db.execute(sql`
   UPDATE "quizzes" 
   SET "description" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("description"->'root'->'children'->0->'children'->0->>'text', ''))
       )
     )
   )
   WHERE "description" IS NOT NULL 
     AND "description"->>'root' IS NOT NULL`)

    await db.execute(sql`
   UPDATE "problems" 
   SET "template" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("template"->'root'->'children'->0->'children'->0->>'text', ''))
       )
     )
   )
   WHERE "template" IS NOT NULL 
     AND "template"->>'root' IS NOT NULL`)

    await db.execute(sql`
   UPDATE "problems" 
   SET "testbench" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("testbench"->'root'->'children'->0->'children'->0->>'text', ''))
       )
     )
   )
   WHERE "testbench" IS NOT NULL 
     AND "testbench"->>'root' IS NOT NULL`)

    await db.execute(sql`
   UPDATE "lesson_notes" 
   SET "content" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("content"->'root'->'children'->0->'children'->0->>'text', ''))
       )
     )
   )
   WHERE "content" IS NOT NULL 
     AND "content"->>'root' IS NOT NULL`)

    console.log('[MIGRATION] ✓ Rollback completed')
}
