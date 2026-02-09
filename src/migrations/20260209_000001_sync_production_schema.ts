import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- Ensure all expected columns exist in payload_locked_documents_rels
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "videos_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "courses_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "batches_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "workshops_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quizzes_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "daily_quizzes_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "problems_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sessions_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "feedback_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "leads_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "course_modules_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "lessons_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "course_progress_id" integer;

    -- Ensure videos table exists (if missing)
    CREATE TABLE IF NOT EXISTS "videos" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "bunny_video_id" varchar NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Ensure foreign keys for payload_locked_documents_rels
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_videos_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
    END $$;

    -- Ensure indexes for payload_locked_documents_rels
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" ("videos_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" ("courses_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_batches_id_idx" ON "payload_locked_documents_rels" ("batches_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_workshops_id_idx" ON "payload_locked_documents_rels" ("workshops_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" ("quizzes_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_daily_quizzes_id_idx" ON "payload_locked_documents_rels" ("daily_quizzes_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_problems_id_idx" ON "payload_locked_documents_rels" ("problems_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" ("sessions_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" ("feedback_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" ("leads_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_course_modules_id_idx" ON "payload_locked_documents_rels" ("course_modules_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" ("lessons_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_course_progress_id_idx" ON "payload_locked_documents_rels" ("course_progress_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Manual migration; down not strictly required for this fix
}
