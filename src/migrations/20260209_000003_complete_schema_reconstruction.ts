import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- 1. Create ENUMs correctly
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

    -- 2. Core Tables and Sequences
    CREATE TABLE IF NOT EXISTS "users" ("id" serial PRIMARY KEY, "display_name" varchar, "role" public.enum_users_role DEFAULT 'customer' NOT NULL, "phone_number" varchar, "batch_id" integer, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "email" varchar NOT NULL, "salt" varchar, "hash" varchar);
    CREATE TABLE IF NOT EXISTS "media" ("id" serial PRIMARY KEY, "alt" varchar NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "url" varchar, "filename" varchar);
    CREATE TABLE IF NOT EXISTS "videos" ("id" serial PRIMARY KEY, "title" varchar NOT NULL, "bunny_video_id" varchar NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS "batches" ("id" serial PRIMARY KEY, "name" varchar NOT NULL, "slug" varchar NOT NULL, "price" numeric NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS "courses" ("id" serial PRIMARY KEY, "title" varchar NOT NULL, "slug" varchar NOT NULL, "description" jsonb NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS "workshops" ("id" serial PRIMARY KEY, "title" varchar NOT NULL, "slug" varchar NOT NULL, "description" varchar NOT NULL, "start_date" timestamp(3) with time zone NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    
    -- Tables mentioned in the errors
    CREATE TABLE IF NOT EXISTS "quizzes" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "description" varchar,
        "is_template" boolean DEFAULT false,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "daily_quizzes" (
        "id" serial PRIMARY KEY,
        "date" timestamp(3) with time zone NOT NULL,
        "batch_id" integer NOT NULL,
        "module_id" integer NOT NULL,
        "question" jsonb NOT NULL,
        "type" public.enum_daily_quizzes_type DEFAULT 'MCQ' NOT NULL,
        "explanation" jsonb,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "sessions" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "quiz_id" integer NOT NULL,
        "host_id" integer NOT NULL,
        "status" public.enum_sessions_status DEFAULT 'WAITING' NOT NULL,
        "mode" public.enum_sessions_mode DEFAULT 'DIY' NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "problems" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "description" jsonb NOT NULL,
        "difficulty" public.enum_problems_difficulty DEFAULT 'Medium',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Additional missing tables
    CREATE TABLE IF NOT EXISTS "feedback" ("id" serial PRIMARY KEY, "name" varchar NOT NULL, "event" varchar NOT NULL, "rating" numeric NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS "leads" ("id" serial PRIMARY KEY, "name" varchar NOT NULL, "status" public.enum_leads_status DEFAULT 'New', "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    
    -- Relationship Tables
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" ("id" serial PRIMARY KEY, "global_slug" varchar, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" ("id" serial PRIMARY KEY, "order" integer, "parent_id" integer NOT NULL, "path" varchar NOT NULL);

    -- Block Tables
    CREATE TABLE IF NOT EXISTS "quizzes_blocks_question" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path text" NOT NULL, "id" varchar PRIMARY KEY, "rich_text" jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS "quizzes_blocks_question_options" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY, "option" varchar);
    CREATE TABLE IF NOT EXISTS "daily_quizzes_options" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" varchar PRIMARY KEY, "option" varchar);

    -- 3. Safety Column Additions for Locked Documents
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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payload_locked_documents_rels' AND column_name='daily_quizzes_id') THEN
            ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "daily_quizzes_id" integer;
        END IF;
    END $$;

    -- 4. Essential Indexes
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" ("path");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Master sync migration
}
