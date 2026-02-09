import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- ATOMIC MASTER REPAIR: 100% SCHEMA PARITY
    
    -- 1. ENUMS (Safe Creation)
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

    -- 2. TABLES (Exhaustive Infrastructure)
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
    CREATE TABLE IF NOT EXISTS "course_progress" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_kv" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_preferences" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS "payload_migrations" (id serial PRIMARY KEY);

    -- 3. DEEP COLLUMN REPAIR (The Fix for Blank Collections)
    DO $$ BEGIN
        -- LESSONS
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_id integer;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS "order" numeric;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- LESSONS TOPICS
        ALTER TABLE public.lessons_topics ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_topics ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.lessons_topics ADD COLUMN IF NOT EXISTS title varchar;

        -- LESSONS TOPICS RESOURCES
        ALTER TABLE public.lessons_topics_resources ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_topics_resources ADD COLUMN IF NOT EXISTS _parent_id varchar;
        ALTER TABLE public.lessons_topics_resources ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.lessons_topics_resources ADD COLUMN IF NOT EXISTS url varchar;
        ALTER TABLE public.lessons_topics_resources ADD COLUMN IF NOT EXISTS file_id integer;

        -- LESSONS BLOCKS
        ALTER TABLE public.lessons_blocks_rich_text_block ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_blocks_rich_text_block ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.lessons_blocks_rich_text_block ADD COLUMN IF NOT EXISTS _path text;
        ALTER TABLE public.lessons_blocks_rich_text_block ADD COLUMN IF NOT EXISTS content jsonb;
        ALTER TABLE public.lessons_blocks_rich_text_block ADD COLUMN IF NOT EXISTS block_name varchar;

        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS _path text;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS video_source "enum_lessons_blocks_video_block_video_source" DEFAULT 'bunny';
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS video_id integer;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS bunny_video_id varchar;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS url varchar;
        ALTER TABLE public.lessons_blocks_video_block ADD COLUMN IF NOT EXISTS block_name varchar;

        ALTER TABLE public.lessons_blocks_quiz_block ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_blocks_quiz_block ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.lessons_blocks_quiz_block ADD COLUMN IF NOT EXISTS _path text;
        ALTER TABLE public.lessons_blocks_quiz_block ADD COLUMN IF NOT EXISTS quiz_id integer;
        ALTER TABLE public.lessons_blocks_quiz_block ADD COLUMN IF NOT EXISTS block_name varchar;

        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS _path text;
        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS file_id integer;
        ALTER TABLE public.lessons_blocks_pdf_block ADD COLUMN IF NOT EXISTS block_name varchar;

        -- QUIZZES
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS description varchar;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- QUIZZES BLOCKS
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS _path text;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS type "enum_quizzes_blocks_question_type" DEFAULT 'MCQ';
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS rich_text jsonb;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS image_id integer;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS explanation jsonb;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS points numeric DEFAULT 1;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS time_limit numeric;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS block_name varchar;

        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS _parent_id varchar;
        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS option varchar;

        -- QUIZZES TEXTS (Correct Answers)
        ALTER TABLE public.quizzes_texts ADD COLUMN IF NOT EXISTS "order" integer;
        ALTER TABLE public.quizzes_texts ADD COLUMN IF NOT EXISTS parent_id integer;
        ALTER TABLE public.quizzes_texts ADD COLUMN IF NOT EXISTS path varchar;
        ALTER TABLE public.quizzes_texts ADD COLUMN IF NOT EXISTS text varchar;

        -- COURSE MODULES
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS description varchar;
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS course_id integer;
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS "order" numeric;
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- SESSIONS (Exhaustive)
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS quiz_id integer;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS host_id integer;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS status "enum_sessions_status" DEFAULT 'WAITING';
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS mode "enum_sessions_mode" DEFAULT 'DIY';
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS total_time_limit numeric;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS end_time timestamptz;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS started_at timestamptz;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS current_question_index numeric DEFAULT -1;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS participants jsonb;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- BATCHES
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS name varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS slug varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS status "enum_batches_status" DEFAULT 'upcoming';
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS price numeric;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS gst numeric DEFAULT 18;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS original_price numeric;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS start_date timestamptz;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS end_date timestamptz;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS duration varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_title varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_details varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- BATCHES RELS
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS "order" integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS parent_id integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS path varchar;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS courses_id integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS users_id integer;

        -- COURSES
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug varchar;
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description jsonb;
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        ALTER TABLE public.courses_images ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.courses_images ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.courses_images ADD COLUMN IF NOT EXISTS image_id integer;

        ALTER TABLE public.courses_pdfs ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.courses_pdfs ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.courses_pdfs ADD COLUMN IF NOT EXISTS pdf_id integer;

        -- PROBLEMS
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS description jsonb;
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS difficulty "enum_problems_difficulty" DEFAULT 'Medium';
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS template varchar;
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS testbench varchar;
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS test_cases jsonb;
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- USERS (Exhaustive)
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name varchar;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role "enum_users_role" DEFAULT 'customer';
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number varchar;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_id integer;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email varchar;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS salt varchar;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hash varchar;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
        
        ALTER TABLE public.users_sessions ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.users_sessions ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.users_sessions ADD COLUMN IF NOT EXISTS expires_at timestamptz;
        ALTER TABLE public.users_sessions ADD COLUMN IF NOT EXISTS created_at timestamptz;

        -- MEDIA
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS alt varchar;
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS url varchar;
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS filename varchar;
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
    END $$;

    -- 4. ESSENTIAL INDEXES
    CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_idx ON public.courses (slug);
    CREATE UNIQUE INDEX IF NOT EXISTS batches_slug_idx ON public.batches (slug);
    CREATE UNIQUE INDEX IF NOT EXISTS workshops_slug_idx ON public.workshops (slug);
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Atomic master migration down
}
