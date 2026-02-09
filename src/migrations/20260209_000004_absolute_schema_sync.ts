import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- 1. ENUM TYPES
    DO $$ BEGIN
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
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
            CREATE TYPE public.enum_users_role AS ENUM ('superadmin', 'customer', 'instructor', 'admin');
        END IF;
    END $$;

    -- 2. CORE TABLES
    CREATE TABLE IF NOT EXISTS public.batches (id serial PRIMARY KEY, name varchar NOT NULL, slug varchar NOT NULL, description varchar, status public.enum_batches_status DEFAULT 'upcoming' NOT NULL, start_date timestamptz, end_date timestamptz, duration varchar, price numeric NOT NULL, gst numeric DEFAULT 18, original_price numeric, offer_title varchar, offer_details varchar, hidden boolean DEFAULT false, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.batches_rels (id serial PRIMARY KEY, "order" integer, parent_id integer NOT NULL, path varchar NOT NULL, users_id integer, courses_id integer);
    CREATE TABLE IF NOT EXISTS public.course_modules (id serial PRIMARY KEY, title varchar NOT NULL, description varchar, course_id integer NOT NULL, "order" numeric, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.course_progress (id serial PRIMARY KEY, user_id integer NOT NULL, course_id integer, lesson_id integer NOT NULL, status public.enum_course_progress_status DEFAULT 'NOT_STARTED', completed_at timestamptz, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.courses (id serial PRIMARY KEY, title varchar NOT NULL, slug varchar NOT NULL, description jsonb NOT NULL, hidden boolean DEFAULT false, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.courses_images (id serial PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, image_id integer);
    CREATE TABLE IF NOT EXISTS public.courses_pdfs (id serial PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, pdf_id integer);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes (id serial PRIMARY KEY, date timestamptz NOT NULL, batch_id integer NOT NULL, module_id integer NOT NULL, question jsonb NOT NULL, type public.enum_daily_quizzes_type DEFAULT 'MCQ' NOT NULL, explanation jsonb, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes_options (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, option varchar);
    CREATE TABLE IF NOT EXISTS public.daily_quizzes_texts (id serial PRIMARY KEY, "order" integer NOT NULL, parent_id integer NOT NULL, path varchar NOT NULL, text varchar);
    CREATE TABLE IF NOT EXISTS public.feedback (id serial PRIMARY KEY, name varchar NOT NULL, event varchar NOT NULL, rating numeric NOT NULL, improvement varchar, additional_comments varchar, source varchar DEFAULT 'web', updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.feedback_interests (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, interest varchar);
    CREATE TABLE IF NOT EXISTS public.leads (id serial PRIMARY KEY, name varchar NOT NULL, phone varchar, source varchar, status public.enum_leads_status DEFAULT 'New', notes varchar, place varchar, read boolean DEFAULT false, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.leads_lead_history (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, action varchar, date timestamptz, details varchar);
    CREATE TABLE IF NOT EXISTS public.lessons (id serial PRIMARY KEY, title varchar NOT NULL, module_id integer NOT NULL, "order" numeric, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_pdf_block (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, _path text NOT NULL, title varchar, file_id integer NOT NULL, block_name varchar);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_quiz_block (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, _path text NOT NULL, quiz_id integer NOT NULL, block_name varchar);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_rich_text_block (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, _path text NOT NULL, content jsonb, block_name varchar);
    CREATE TABLE IF NOT EXISTS public.lessons_blocks_video_block (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, _path text NOT NULL, title varchar, video_source public.enum_lessons_blocks_video_block_video_source DEFAULT 'bunny', bunny_video_id varchar, url varchar, block_name varchar, video_id integer);
    CREATE TABLE IF NOT EXISTS public.lessons_topics (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, title varchar NOT NULL);
    CREATE TABLE IF NOT EXISTS public.lessons_topics_resources (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id varchar NOT NULL, title varchar, url varchar, file_id integer);
    CREATE TABLE IF NOT EXISTS public.media (id serial PRIMARY KEY, alt varchar NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, url varchar, thumbnail_u_r_l varchar, filename varchar, mime_type varchar, filesize numeric, width numeric, height numeric, focal_x numeric, focal_y numeric);
    CREATE TABLE IF NOT EXISTS public.payload_kv (id serial PRIMARY KEY, key varchar NOT NULL, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS public.payload_locked_documents (id serial PRIMARY KEY, global_slug varchar, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.payload_locked_documents_rels (id serial PRIMARY KEY, "order" integer, parent_id integer NOT NULL, path varchar NOT NULL, users_id integer, media_id integer, courses_id integer, batches_id integer, workshops_id integer, quizzes_id integer, problems_id integer, sessions_id integer, feedback_id integer, leads_id integer, course_modules_id integer, lessons_id integer, course_progress_id integer, videos_id integer, daily_quizzes_id integer);
    CREATE TABLE IF NOT EXISTS public.payload_migrations (id serial PRIMARY KEY, name varchar, batch numeric, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.payload_preferences (id serial PRIMARY KEY, key varchar, value jsonb, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.payload_preferences_rels (id serial PRIMARY KEY, "order" integer, parent_id integer NOT NULL, path varchar NOT NULL, users_id integer);
    CREATE TABLE IF NOT EXISTS public.problems (id serial PRIMARY KEY, title varchar NOT NULL, description jsonb NOT NULL, difficulty public.enum_problems_difficulty DEFAULT 'Medium', template varchar, testbench varchar, test_cases jsonb, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.quizzes (id serial PRIMARY KEY, title varchar NOT NULL, description varchar, is_template boolean DEFAULT false, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.quizzes_blocks_question (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, _path text NOT NULL, type public.enum_quizzes_blocks_question_type DEFAULT 'MCQ', image_id integer, points numeric DEFAULT 1, time_limit numeric, block_name varchar, rich_text jsonb NOT NULL, explanation jsonb);
    CREATE TABLE IF NOT EXISTS public.quizzes_blocks_question_options (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id varchar NOT NULL, option varchar);
    CREATE TABLE IF NOT EXISTS public.quizzes_texts (id serial PRIMARY KEY, "order" integer NOT NULL, parent_id integer NOT NULL, path varchar NOT NULL, text varchar);
    CREATE TABLE IF NOT EXISTS public.sessions (id serial PRIMARY KEY, title varchar NOT NULL, quiz_id integer NOT NULL, host_id integer NOT NULL, status public.enum_sessions_status DEFAULT 'WAITING' NOT NULL, mode public.enum_sessions_mode DEFAULT 'DIY' NOT NULL, total_time_limit numeric, end_time timestamptz, started_at timestamptz, ended_at timestamptz, current_question_index numeric DEFAULT '-1', participants jsonb, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.users (id serial PRIMARY KEY, display_name varchar, role public.enum_users_role DEFAULT 'customer' NOT NULL, phone_number varchar, batch_id integer, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, email varchar NOT NULL, reset_password_token varchar, reset_password_expiration timestamptz, salt varchar, hash varchar, login_attempts numeric DEFAULT 0, lock_until timestamptz);
    CREATE TABLE IF NOT EXISTS public.users_sessions (id varchar PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, created_at timestamptz, expires_at timestamptz NOT NULL);
    CREATE TABLE IF NOT EXISTS public.videos (id serial PRIMARY KEY, title varchar NOT NULL, bunny_video_id varchar NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.workshops (id serial PRIMARY KEY, title varchar NOT NULL, slug varchar NOT NULL, description varchar NOT NULL, start_date timestamptz NOT NULL, end_date timestamptz, instructor varchar, price numeric, place varchar, preset_college varchar, hidden boolean DEFAULT false, updated_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
    CREATE TABLE IF NOT EXISTS public.workshops_images (id serial PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, image_id integer);
    CREATE TABLE IF NOT EXISTS public.workshops_pdfs (id serial PRIMARY KEY, _order integer NOT NULL, _parent_id integer NOT NULL, pdf_id integer);
    CREATE TABLE IF NOT EXISTS public.workshops_rels (id serial PRIMARY KEY, "order" integer, parent_id integer NOT NULL, path varchar NOT NULL, users_id integer);

    -- 3. INDEXES
    CREATE INDEX IF NOT EXISTS batches_created_at_idx ON public.batches (created_at);
    CREATE INDEX IF NOT EXISTS batches_updated_at_idx ON public.batches (updated_at);
    CREATE UNIQUE INDEX IF NOT EXISTS batches_slug_idx ON public.batches (slug);
    CREATE INDEX IF NOT EXISTS batches_rels_parent_idx ON public.batches_rels (parent_id);
    CREATE INDEX IF NOT EXISTS batches_rels_path_idx ON public.batches_rels (path);
    CREATE INDEX IF NOT EXISTS course_modules_course_idx ON public.course_modules (course_id);
    CREATE INDEX IF NOT EXISTS courses_slug_idx ON public.courses (slug);
    CREATE INDEX IF NOT EXISTS lessons_module_idx ON public.lessons (module_id);
    CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels (parent_id);
    CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels (path);
    CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
    CREATE INDEX IF NOT EXISTS workshops_slug_idx ON public.workshops (slug);
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Absolute schema sync
}
