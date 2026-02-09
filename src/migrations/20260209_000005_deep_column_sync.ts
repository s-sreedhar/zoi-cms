import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- DEEP REPAIR: Add missing columns to existing tables
    -- This fixes the issue where tables exist but are empty/incomplete (Error 42703)

    DO $$ 
    BEGIN
        -- 1. BATCHES
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batches') THEN
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS name varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS slug varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS description varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS status public.enum_batches_status DEFAULT 'upcoming';
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS start_date timestamptz;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS end_date timestamptz;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS duration varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS price numeric;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS gst numeric DEFAULT 18;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS original_price numeric;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_title varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS offer_details varchar;
            ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        END IF;

        -- 2. QUIZZES
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
            ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS title varchar;
            ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS description varchar;
            ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
        END IF;

        -- 3. DAILY QUIZZES
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_quizzes') THEN
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS date timestamptz;
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS batch_id integer;
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS module_id integer;
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS question jsonb;
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS type public.enum_daily_quizzes_type DEFAULT 'MCQ';
            ALTER TABLE public.daily_quizzes ADD COLUMN IF NOT EXISTS explanation jsonb;
        END IF;

        -- 4. SESSIONS
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS title varchar;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS quiz_id integer;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS host_id integer;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS status public.enum_sessions_status DEFAULT 'WAITING';
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS mode public.enum_sessions_mode DEFAULT 'DIY';
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS total_time_limit numeric;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS end_time timestamptz;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS started_at timestamptz;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS current_question_index numeric DEFAULT '-1';
            ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS participants jsonb;
        END IF;

        -- 5. USERS
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name varchar;
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role public.enum_users_role DEFAULT 'customer';
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number varchar;
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_id integer;
        END IF;

         -- 6. COURSES
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
             ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title varchar;
             ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug varchar;
             ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description jsonb;
             ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        END IF;
        
        -- 7. WORKSHOPS
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workshops') THEN
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS title varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS slug varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS description varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS start_date timestamptz;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS end_date timestamptz;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS instructor varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS price numeric;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS place varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS preset_college varchar;
            ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
        END IF;

    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Deep repair sync
}
