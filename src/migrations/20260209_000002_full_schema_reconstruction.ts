import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- 1. Safely create ENUM types
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
            CREATE TYPE public.enum_users_role AS ENUM ('superadmin', 'customer', 'instructor', 'admin');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_batches_status') THEN
            CREATE TYPE public.enum_batches_status AS ENUM ('upcoming', 'open', 'in_progress', 'closed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_course_progress_status') THEN
            CREATE TYPE public.enum_course_progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_daily_quizzes_type') THEN
            CREATE TYPE public.enum_daily_quizzes_type AS ENUM ('MCQ', 'MSQ', 'TEXT', 'NUMBER');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_leads_status') THEN
            CREATE TYPE public.enum_leads_status AS ENUM ('New', 'Contacted', 'Interested', 'Converted', 'Closed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lessons_blocks_video_block_video_source') THEN
            CREATE TYPE public.enum_lessons_blocks_video_block_video_source AS ENUM ('bunny', 'youtube', 'custom');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_problems_difficulty') THEN
            CREATE TYPE public.enum_problems_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_quizzes_blocks_question_type') THEN
            CREATE TYPE public.enum_quizzes_blocks_question_type AS ENUM ('MCQ', 'MSQ', 'TEXT', 'NUMBER');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_mode') THEN
            CREATE TYPE public.enum_sessions_mode AS ENUM ('INTERACTIVE', 'DIY');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_status') THEN
            CREATE TYPE public.enum_sessions_status AS ENUM ('WAITING', 'ACTIVE', 'FINISHED');
        END IF;
    END $$;

    -- 2. Create core tables if missing
    CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "display_name" varchar,
        "role" public.enum_users_role DEFAULT 'customer' NOT NULL,
        "phone_number" varchar,
        "batch_id" integer,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "email" varchar NOT NULL,
        "reset_password_token" varchar,
        "reset_password_expiration" timestamp(3) with time zone,
        "salt" varchar,
        "hash" varchar,
        "login_attempts" numeric DEFAULT 0,
        "lock_until" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "media" (
        "id" serial PRIMARY KEY,
        "alt" varchar NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "url" varchar,
        "thumbnail_u_r_l" varchar,
        "filename" varchar,
        "mime_type" varchar,
        "filesize" numeric,
        "width" numeric,
        "height" numeric,
        "focal_x" numeric,
        "focal_y" numeric
    );

    CREATE TABLE IF NOT EXISTS "videos" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "bunny_video_id" varchar NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "batches" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "description" varchar,
        "status" public.enum_batches_status DEFAULT 'upcoming' NOT NULL,
        "start_date" timestamp(3) with time zone,
        "end_date" timestamp(3) with time zone,
        "duration" varchar,
        "price" numeric NOT NULL,
        "gst" numeric DEFAULT 18,
        "original_price" numeric,
        "offer_title" varchar,
        "offer_details" varchar,
        "hidden" boolean DEFAULT false,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "courses" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "description" jsonb NOT NULL,
        "hidden" boolean DEFAULT false,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
        "id" serial PRIMARY KEY,
        "global_slug" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL
    );

    -- 3. Safely add columns to payload_locked_documents_rels
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='users_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "users_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='media_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='videos_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='courses_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='batches_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "batches_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='workshops_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "workshops_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='quizzes_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quizzes_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='problems_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "problems_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='sessions_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sessions_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='feedback_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='leads_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='course_modules_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_modules_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='lessons_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lessons_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='course_progress_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_progress_id" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='daily_quizzes_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "daily_quizzes_id" integer;
        END IF;
    END $$;

    -- 4. Create other required tables
    CREATE TABLE IF NOT EXISTS "workshops" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "description" varchar NOT NULL,
        "start_date" timestamp(3) with time zone NOT NULL,
        "end_date" timestamp(3) with time zone,
        "instructor" varchar,
        "price" numeric,
        "place" varchar,
        "preset_college" varchar,
        "hidden" boolean DEFAULT false,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "course_modules" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "description" varchar,
        "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "order" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "lessons" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "module_id" integer NOT NULL REFERENCES "course_modules"("id") ON DELETE CASCADE,
        "order" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "course_progress" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" integer REFERENCES "courses"("id") ON DELETE SET NULL,
        "lesson_id" integer NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
        "status" public.enum_course_progress_status DEFAULT 'NOT_STARTED',
        "completed_at" timestamp(3) with time zone,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- 5. Add Foreign Key constraints safely
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_parent_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_users_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_videos_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE CASCADE;
        END IF;
    END $$;

    -- 6. Add basic indexes
    CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" ("videos_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Manual reconstruction; down not strictly required for this fix
}
