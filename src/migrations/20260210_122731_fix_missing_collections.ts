import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
   -- SAFETY MIGRATION: Ensure Lessons and Quizzes schema exists
   -- This catches any cases where previous migrations ran but tables/columns are missing.

   -- 1. ENUMS (Safe Creation)
   DO $$ BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lessons_blocks_video_block_video_source') THEN CREATE TYPE "public"."enum_lessons_blocks_video_block_video_source" AS ENUM('bunny', 'youtube', 'custom'); END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_quizzes_blocks_question_type') THEN CREATE TYPE "public"."enum_quizzes_blocks_question_type" AS ENUM('MCQ', 'MSQ', 'TEXT', 'NUMBER'); END IF;
   END $$;

   -- 2. TABLES (Ensure Existence)
   CREATE TABLE IF NOT EXISTS "lessons" (id serial PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_topics" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_topics_resources" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_blocks_rich_text_block" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_blocks_video_block" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_blocks_quiz_block" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "lessons_blocks_pdf_block" (id varchar PRIMARY KEY);

   CREATE TABLE IF NOT EXISTS "quizzes" (id serial PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "quizzes_blocks_question" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "quizzes_blocks_question_options" (id varchar PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS "quizzes_texts" (id serial PRIMARY KEY);
   
   CREATE TABLE IF NOT EXISTS "course_modules" (id serial PRIMARY KEY);

   -- 3. COLUMNS (Deep Repair)
   DO $$ BEGIN
        -- LESSONS
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_id integer;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS "order" numeric;
        ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS temp_trigger varchar;
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

   END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Integrity safety: We do not drop tables in down migrations to prevent accidental data loss.
    // If you must revert, do so manually or revert the git commit and re-deploy a drop migration.
}
