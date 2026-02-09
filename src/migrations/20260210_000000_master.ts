import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- MASTER CONSOLIDATED SYNC: Enums, Tables, and Columns
    
    -- 1. ENUMS
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_batches_status') THEN CREATE TYPE public.enum_batches_status AS ENUM ('upcoming', 'open', 'in_progress', 'closed'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_course_progress_status') THEN CREATE TYPE public.enum_course_progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_daily_quizzes_type') THEN CREATE TYPE public.enum_daily_quizzes_type AS ENUM ('MCQ', 'MSQ', 'TEXT', 'NUMBER'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_leads_status') THEN CREATE TYPE public.enum_leads_status AS ENUM ('New', 'Contacted', 'Interested', 'Converted', 'Closed'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lessons_blocks_video_block_video_source') THEN CREATE TYPE public.enum_lessons_blocks_video_block_video_source AS ENUM ('bunny', 'youtube', 'custom'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_problems_difficulty') THEN CREATE TYPE public.enum_problems_difficulty AS ENUM ('Easy', 'Medium', 'Hard'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_quizzes_blocks_question_type') THEN CREATE TYPE public.enum_quizzes_blocks_question_type AS ENUM ('MCQ', 'MSQ', 'TEXT', 'NUMBER'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_mode') THEN CREATE TYPE public.enum_sessions_mode AS ENUM ('INTERACTIVE', 'DIY'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_status') THEN CREATE TYPE public.enum_sessions_status AS ENUM ('WAITING', 'ACTIVE', 'FINISHED'); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN CREATE TYPE public.enum_users_role AS ENUM ('superadmin', 'customer', 'instructor', 'admin'); END IF;
    END $$;

    -- 2. TABLES (Exhaustive List)
    CREATE TABLE IF NOT EXISTS public.batches (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.batches_rels (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.course_modules (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.course_progress (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.courses (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.courses_images (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.courses_pdfs (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes_options (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes_texts (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.feedback (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.feedback_interests (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.leads (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.leads_lead_history (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_pdf_block (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_quiz_block (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_rich_text_block (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_video_block (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_topics (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.lessons_topics_resources (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.media (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_kv (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_locked_documents (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_locked_documents_rels (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_migrations (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_preferences (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.payload_preferences_rels (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.problems (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.quizzes (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.quizzes_blocks_question (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.quizzes_blocks_question_options (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.quizzes_texts (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.sessions (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.users (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.users_sessions (id varchar PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.videos (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.workshops (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.workshops_images (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.workshops_pdfs (id serial PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS public.workshops_rels (id serial PRIMARY KEY);

    -- 3. DEEP COLUMN SYNC
    DO $$ BEGIN
        -- BATCHES
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS name varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS slug varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS price numeric;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS gst numeric DEFAULT 18;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS original_price numeric;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS status public.enum_batches_status DEFAULT 'upcoming';
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS start_date timestamptz;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS end_date timestamptz;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS duration varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_title varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_details varchar;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- BATCHES RELS
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS parent_id integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS path varchar;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS "order" integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS users_id integer;
        ALTER TABLE public.batches_rels ADD COLUMN IF NOT EXISTS courses_id integer;

        -- QUIZZES
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS description varchar;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- DAILY QUIZZES
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS date timestamptz;
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS batch_id integer;
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS module_id integer;
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS question jsonb;
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS type public.enum_daily_quizzes_type DEFAULT 'MCQ';
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- DAILY QUIZZES OPTIONS
        ALTER TABLE public.daily_quizzes_options ADD COLUMN IF NOT EXISTS _parent_id integer;
        ALTER TABLE public.daily_quizzes_options ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.daily_quizzes_options ADD COLUMN IF NOT EXISTS option varchar;

        -- DAILY QUIZZES TEXTS (for hasMany correctAnswers)
        ALTER TABLE public.daily_quizzes_texts ADD COLUMN IF NOT EXISTS parent_id integer;
        ALTER TABLE public.daily_quizzes_texts ADD COLUMN IF NOT EXISTS "order" integer;
        ALTER TABLE public.daily_quizzes_texts ADD COLUMN IF NOT EXISTS text varchar;

        -- SESSIONS
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS quiz_id integer;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS host_id integer;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS status public.enum_sessions_status DEFAULT 'WAITING';
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS mode public.enum_sessions_mode DEFAULT 'DIY';
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

        -- LOCKED DOCS RELS
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS parent_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS path varchar;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS users_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS media_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS courses_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS batches_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS workshops_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS quizzes_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS problems_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS sessions_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS videos_id integer;
        ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS daily_quizzes_id integer;

        -- BLOCKS
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS "_path" text;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS "_parent_id" integer;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS "rich_text" jsonb;
        ALTER TABLE public.quizzes_blocks_question ADD COLUMN IF NOT EXISTS "type" public.enum_quizzes_blocks_question_type DEFAULT 'MCQ';
        
        -- BLOCK OPTIONS
        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS _parent_id varchar;
        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS _order integer;
        ALTER TABLE public.quizzes_blocks_question_options ADD COLUMN IF NOT EXISTS option varchar;

        -- MEDIA
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS alt varchar;
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS url varchar;
        ALTER TABLE public.media ADD COLUMN IF NOT EXISTS filename varchar;
    END $$;

    -- 4. ESSENTIAL INDEXES
    CREATE INDEX IF NOT EXISTS batches_slug_idx ON public.batches (slug);
    CREATE INDEX IF NOT EXISTS courses_slug_idx ON public.courses (slug);
    CREATE INDEX IF NOT EXISTS workshops_slug_idx ON public.workshops (slug);
    CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Consolidated master migration down
}
