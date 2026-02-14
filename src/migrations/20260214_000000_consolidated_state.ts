import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  console.log('[MIGRATION] Starting consolidated state migration...')

  // ========================================
  // 1. ENUMS (Safe Creation)
  // ========================================
  await db.execute(sql`
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN CREATE TYPE "public"."enum_users_role" AS ENUM('superadmin', 'customer', 'instructor', 'admin'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_batches_status') THEN CREATE TYPE "public"."enum_batches_status" AS ENUM('upcoming', 'open', 'in_progress', 'closed'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_quizzes_blocks_question_type') THEN CREATE TYPE "public"."enum_quizzes_blocks_question_type" AS ENUM('MCQ', 'MSQ', 'TEXT', 'NUMBER'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_daily_quizzes_type') THEN CREATE TYPE "public"."enum_daily_quizzes_type" AS ENUM('MCQ', 'MSQ', 'TEXT', 'NUMBER'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_problems_difficulty') THEN CREATE TYPE "public"."enum_problems_difficulty" AS ENUM('Easy', 'Medium', 'Hard'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_status') THEN CREATE TYPE "public"."enum_sessions_status" AS ENUM('WAITING', 'ACTIVE', 'FINISHED'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_mode') THEN CREATE TYPE "public"."enum_sessions_mode" AS ENUM('INTERACTIVE', 'DIY'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_leads_status') THEN CREATE TYPE "public"."enum_leads_status" AS ENUM('New', 'Contacted', 'Interested', 'Converted', 'Closed'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lessons_blocks_video_block_video_source') THEN CREATE TYPE "public"."enum_lessons_blocks_video_block_video_source" AS ENUM('bunny', 'youtube', 'custom'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_course_progress_status') THEN CREATE TYPE "public"."enum_course_progress_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'); END IF;
    END $$;
  `)

  // ========================================
  // 2. TABLES (Safe Creation)
  // ========================================
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "users_sessions" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "media" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "videos" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "courses" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "courses_images" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "courses_pdfs" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "batches" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "batches_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "workshops" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "workshops_images" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "workshops_pdfs" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "workshops_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "quizzes" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "quizzes_blocks_question" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "quizzes_blocks_question_options" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "quizzes_texts" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "daily_quizzes" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "daily_quizzes_options" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "daily_quizzes_texts" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "problems" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "sessions" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "feedback" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "feedback_interests" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "leads" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "leads_lead_history" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "course_modules" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_topics" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_topics_resources" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_blocks_rich_text_block" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_blocks_video_block" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_blocks_quiz_block" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lessons_blocks_pdf_block" (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "lesson_notes" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "course_progress" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_kv" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_preferences" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_migrations" (id serial PRIMARY KEY);
  `)

  // ========================================
  // 3. COLUMNS (Idempotent Add)
  // ========================================

  // USERS
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'customer'`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_number" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "batch_id" integer`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salt" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hash" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)
  // Google Auth & Streak Fields
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "calendar_id" varchar`)
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streak" numeric DEFAULT 0`)

  // LESSON NOTES (Including Critical Fixes)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "lesson_id" integer`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "user_id" integer`) // Critical Fix
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "batch_id" integer`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "content" jsonb`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // QUIZZES
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "description" jsonb`)
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "is_template" boolean DEFAULT false`)
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // DAILY QUIZZES
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "date" timestamptz`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "batch_id" integer`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "module_id" integer`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "description" jsonb`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "question" jsonb`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "image_id" integer`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "type" "enum_daily_quizzes_type" DEFAULT 'MCQ'`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "explanation" jsonb`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // PROBLEMS
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "description" jsonb`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "difficulty" "enum_problems_difficulty" DEFAULT 'Medium'`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "template" jsonb`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "testbench" jsonb`)
  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "test_cases"`) // Cleanup old column
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // COURSE MODULES
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "description" varchar`)
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "course_id" integer`)
  // Note: 'batch' relationship with hasMany:true uses course_modules_rels table, not a column
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "order" numeric`)
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // LESSONS
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "title" varchar`)
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "module_id" integer`)
  // Note: 'batch' relationship with hasMany:true uses lessons_rels table, not a column
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "order" numeric`)
  await db.execute(sql`ALTER TABLE "lessons" DROP COLUMN IF EXISTS "temp_trigger"`) // Cleanup
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`)
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`)

  // NEW RELATIONSHIP TABLES (for hasMany relationships)
  await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_modules_rels" (
        id serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer,
        "path" varchar,
        "batches_id" integer
      );
      CREATE TABLE IF NOT EXISTS "lessons_rels" (
        id serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer,
        "path" varchar,
        "batches_id" integer
      );
    `)

  // ========================================
  // 4. CONSTRAINTS (Idempotent Add)
  // ========================================

  await db.execute(sql`
    DO $$
    BEGIN
      -- Lesson Notes FKs
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_user_id_users_id_fk') THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_lesson_id_lessons_id_fk') THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_batch_id_batches_id_fk') THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;

      -- Sessions FKs
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_batch_id_batches_id_fk') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      
      -- Daily Quiz FKs
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_quizzes_batch_id_batches_id_fk') THEN
        ALTER TABLE "daily_quizzes" ADD CONSTRAINT "daily_quizzes_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_quizzes_module_id_course_modules_id_fk') THEN
        ALTER TABLE "daily_quizzes" ADD CONSTRAINT "daily_quizzes_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE set null ON UPDATE no action;
      END IF;

      -- Relationship Table FKs (course_modules_rels)
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_modules_rels_parent_fk') THEN
        ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_modules_rels_batches_fk') THEN
        ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_batches_fk" FOREIGN KEY ("batches_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- Relationship Table FKs (lessons_rels)
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_rels_parent_fk') THEN
        ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_rels_batches_fk') THEN
        ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_batches_fk" FOREIGN KEY ("batches_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

    END $$;`)

  // ========================================
  // 5. INDEXES & DATA FIXES
  // ========================================

  // Indexes
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email")`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quizzes_slug_idx" ON "quizzes" USING btree ("slug")`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "daily_quizzes_slug_idx" ON "daily_quizzes" USING btree ("slug")`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "batches_slug_idx" ON "batches" USING btree ("slug")`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "courses_slug_idx" ON "courses" USING btree ("slug")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "sessions_batch_idx" ON "sessions" USING btree ("batch_id")`)

  // Data Fixes - Repair Malformed Lexical JSON (Safe idempotent check)
  const collections = [
    { table: 'lesson_notes', column: 'content' },
    { table: 'quizzes', column: 'description' },
    { table: 'daily_quizzes', column: 'description' },
    { table: 'daily_quizzes', column: 'question' }, // Also fix question field
    { table: 'daily_quizzes', column: 'explanation' }, // Also fix explanation field
    { table: 'problems', column: 'description' },
    { table: 'problems', column: 'template' },
    { table: 'problems', column: 'testbench' },
    { table: 'courses', column: 'description' }
  ]

  for (const { table, column } of collections) {
    // 1. Ensure column is JSONB (Safe conversion from Text/Varchar if needed)
    await db.execute(sql`
       ALTER TABLE "${sql.raw(table)}" 
       ALTER COLUMN "${sql.raw(column)}" TYPE jsonb 
       USING CASE 
         WHEN "${sql.raw(column)}"::text ~ '^\s*[\{\[]' THEN "${sql.raw(column)}"::jsonb
         WHEN "${sql.raw(column)}" IS NULL THEN NULL
         ELSE jsonb_build_object(
            'root', jsonb_build_object(
              'type', 'root',
              'children', jsonb_build_array(
                jsonb_build_object(
                  'type', 'paragraph',
                  'children', jsonb_build_array(
                    jsonb_build_object(
                      'type', 'text',
                      'text', "${sql.raw(column)}"::text, 
                      'version', 1
                    )
                  ),
                  'version', 1
                )
              ),
              'version', 1
            )
          )
       END
    `)

    // 2. Repair existing JSONB structure (e.g. Arrays -> Root Object)
    await db.execute(sql`
       UPDATE "${sql.raw(table)}" 
       SET "${sql.raw(column)}" = CASE
         WHEN jsonb_typeof("${sql.raw(column)}") = 'object' AND "${sql.raw(column)}" ? 'root' THEN "${sql.raw(column)}"
         WHEN jsonb_typeof("${sql.raw(column)}") = 'array' THEN jsonb_build_object(
            'root', jsonb_build_object(
              'type', 'root',
              'children', jsonb_build_array(
                jsonb_build_object(
                  'type', 'paragraph',
                  'children', jsonb_build_array(
                    jsonb_build_object(
                      'type', 'text',
                      'text', COALESCE("${sql.raw(column)}"->0->'children'->0->>'text', ''),
                      'version', 1
                    )
                  ),
                  'version', 1
                )
              ),
              'version', 1
            )
          )
         ELSE "${sql.raw(column)}"
       END
       WHERE "${sql.raw(column)}" IS NOT NULL`)
  }

  console.log('[MIGRATION] ✅ Consolidated state migration completed successfully')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  console.log('[MIGRATION] Down migration not implemented for consolidated state.')
}
