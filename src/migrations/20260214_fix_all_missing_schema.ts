import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    console.log('[MIGRATION] Starting comprehensive schema repair and data fix...')

    // ========================================
    // 1. LESSON NOTES
    // ========================================
    console.log('[MIGRATION] Checking lesson_notes schema...')

    // Add user_id if missing (Critical fix for "column user_id does not exist")
    await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "user_id" integer`)

    // Add foreign key for user_id
    await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_user_id_users_id_fk') THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_user_id_users_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`)

    // Add batch_id
    await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "batch_id" integer`)

    // Add foreign key for batch_id
    await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_batch_id_batches_id_fk') THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_batch_id_batches_id_fk" 
          FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`)

    // Ensure content column exists as jsonb
    // If it exists as text/varchar, it might need conversion, but usually we just add if not exists
    // If it was renamed in previous broken migrations, we might need to handle that, 
    // but standard "ADD COLUMN IF NOT EXISTS" is safest for "missing" columns.
    await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "content" jsonb`)

    // Fix Malformed Lexical JSON in content
    await db.execute(sql`
   UPDATE "lesson_notes" 
   SET "content" = CASE
     -- If already correct (object with root), keep it
     WHEN jsonb_typeof("content") = 'object' AND "content" ? 'root' THEN "content"
     -- If malformed array, wrap it
     WHEN jsonb_typeof("content") = 'array' THEN jsonb_build_object(
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
     -- Fallback for safety (though column is jsonb)
     ELSE "content"
   END
   WHERE "content" IS NOT NULL`)

    // ========================================
    // 2. QUIZZES & DAILY QUIZZES
    // ========================================
    console.log('[MIGRATION] Checking quizzes schema...')

    // Quizzes - Slug
    await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quizzes_slug_idx" ON "quizzes" USING btree ("slug")`)

    // Quizzes - Description (RichText)
    await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "description" jsonb`)

    // Fix Malformed Lexical JSON in description
    await db.execute(sql`
   UPDATE "quizzes" 
   SET "description" = CASE
     WHEN jsonb_typeof("description") = 'object' AND "description" ? 'root' THEN "description"
     WHEN jsonb_typeof("description") = 'array' THEN jsonb_build_object(
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
     ELSE "description"
   END
   WHERE "description" IS NOT NULL`)

    // Daily Quizzes
    await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)
    await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "description" jsonb`)
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "daily_quizzes_slug_idx" ON "daily_quizzes" USING btree ("slug")`)

    // ========================================
    // 3. COURSE MODULES & LESSONS
    // ========================================
    console.log('[MIGRATION] Checking course_modules and lessons schema...')

    // Course Modules - Batch Array
    await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "batch" integer[]`)

    // Lessons - Batch Array
    await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "batch" integer[]`)

    // Lessons - Cleanup
    await db.execute(sql`ALTER TABLE "lessons" DROP COLUMN IF EXISTS "temp_trigger"`)

    // ========================================
    // 4. PROBLEMS
    // ========================================
    console.log('[MIGRATION] Checking problems schema...')

    // Clean up old columns
    await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "test_cases"`)

    // Ensure richText columns exist
    await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "template" jsonb`)
    await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "testbench" jsonb`)

    // Fix Malformed Lexical JSON in template
    await db.execute(sql`
   UPDATE "problems" 
   SET "template" = CASE
     WHEN jsonb_typeof("template") = 'object' AND "template" ? 'root' THEN "template"
     WHEN jsonb_typeof("template") = 'array' THEN jsonb_build_object(
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
     ELSE "template"
   END
   WHERE "template" IS NOT NULL`)

    // Fix Malformed Lexical JSON in testbench
    await db.execute(sql`
   UPDATE "problems" 
   SET "testbench" = CASE
     WHEN jsonb_typeof("testbench") = 'object' AND "testbench" ? 'root' THEN "testbench"
     WHEN jsonb_typeof("testbench") = 'array' THEN jsonb_build_object(
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
     ELSE "testbench"
   END
   WHERE "testbench" IS NOT NULL`)

    // ========================================
    // 5. SESSIONS
    // ========================================
    console.log('[MIGRATION] Checking sessions schema...')

    await db.execute(sql`ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "batch_id" integer`)

    await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_batch_id_batches_id_fk') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_batch_id_batches_id_fk" 
          FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`)

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "sessions_batch_idx" ON "sessions" USING btree ("batch_id")`)

    console.log('[MIGRATION] ✅ Comprehensive schema repair completed successfully')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // We generally don't want to revert "Fixes" as it would break the app again.
    // But for completeness, we can drop the columns we "might" have added.
    // Ideally, this migration shouldn't be reverted in production.
    console.log('[MIGRATION] Revert not recommended for schema repair migration.')
}
