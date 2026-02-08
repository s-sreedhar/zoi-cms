import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('superadmin', 'customer', 'instructor', 'admin');
  CREATE TYPE "public"."enum_batches_status" AS ENUM('upcoming', 'open', 'in_progress', 'closed');
  CREATE TYPE "public"."enum_quizzes_blocks_question_type" AS ENUM('MCQ', 'MSQ', 'TEXT', 'NUMBER');
  CREATE TYPE "public"."enum_daily_quizzes_type" AS ENUM('MCQ', 'MSQ', 'TEXT', 'NUMBER');
  CREATE TYPE "public"."enum_problems_difficulty" AS ENUM('Easy', 'Medium', 'Hard');
  CREATE TYPE "public"."enum_sessions_status" AS ENUM('WAITING', 'ACTIVE', 'FINISHED');
  CREATE TYPE "public"."enum_sessions_mode" AS ENUM('INTERACTIVE', 'DIY');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('New', 'Contacted', 'Interested', 'Converted', 'Closed');
  CREATE TYPE "public"."enum_lessons_blocks_video_block_video_source" AS ENUM('bunny', 'youtube', 'custom');
  CREATE TYPE "public"."enum_course_progress_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"role" "enum_users_role" DEFAULT 'customer' NOT NULL,
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"bunny_video_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "courses_pdfs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pdf_id" integer
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "batches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_batches_status" DEFAULT 'upcoming' NOT NULL,
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
  
  CREATE TABLE "batches_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "workshops_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "workshops_pdfs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pdf_id" integer
  );
  
  CREATE TABLE "workshops" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "workshops_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "quizzes_blocks_question_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option" varchar
  );
  
  CREATE TABLE "quizzes_blocks_question" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_quizzes_blocks_question_type" DEFAULT 'MCQ',
  	"rich_text" jsonb NOT NULL,
  	"image_id" integer,
  	"explanation" jsonb,
  	"points" numeric DEFAULT 1,
  	"time_limit" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"is_template" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quizzes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "daily_quizzes_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option" varchar
  );
  
  CREATE TABLE "daily_quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"batch_id" integer NOT NULL,
  	"module_id" integer NOT NULL,
  	"question" jsonb NOT NULL,
  	"type" "enum_daily_quizzes_type" DEFAULT 'MCQ' NOT NULL,
  	"explanation" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "daily_quizzes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "problems" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"difficulty" "enum_problems_difficulty" DEFAULT 'Medium',
  	"template" varchar,
  	"testbench" varchar,
  	"test_cases" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"quiz_id" integer NOT NULL,
  	"host_id" integer NOT NULL,
  	"status" "enum_sessions_status" DEFAULT 'WAITING' NOT NULL,
  	"mode" "enum_sessions_mode" DEFAULT 'DIY' NOT NULL,
  	"total_time_limit" numeric,
  	"end_time" timestamp(3) with time zone,
  	"started_at" timestamp(3) with time zone,
  	"ended_at" timestamp(3) with time zone,
  	"current_question_index" numeric DEFAULT -1,
  	"participants" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback_interests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"interest" varchar
  );
  
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"event" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"improvement" varchar,
  	"additional_comments" varchar,
  	"source" varchar DEFAULT 'web',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_lead_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"action" varchar,
  	"date" timestamp(3) with time zone,
  	"details" varchar
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"source" varchar,
  	"status" "enum_leads_status" DEFAULT 'New',
  	"notes" varchar,
  	"place" varchar,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"course_id" integer NOT NULL,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lessons_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"video_source" "enum_lessons_blocks_video_block_video_source" DEFAULT 'bunny',
  	"video_id" integer,
  	"bunny_video_id" varchar,
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_quiz_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quiz_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_pdf_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"file_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_topics_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"file_id" integer
  );
  
  CREATE TABLE "lessons_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"module_id" integer NOT NULL,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"course_id" integer,
  	"lesson_id" integer NOT NULL,
  	"status" "enum_course_progress_status" DEFAULT 'NOT_STARTED',
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"videos_id" integer,
  	"courses_id" integer,
  	"batches_id" integer,
  	"workshops_id" integer,
  	"quizzes_id" integer,
  	"daily_quizzes_id" integer,
  	"problems_id" integer,
  	"sessions_id" integer,
  	"feedback_id" integer,
  	"leads_id" integer,
  	"course_modules_id" integer,
  	"lessons_id" integer,
  	"course_progress_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_images" ADD CONSTRAINT "courses_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_images" ADD CONSTRAINT "courses_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_pdfs" ADD CONSTRAINT "courses_pdfs_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_pdfs" ADD CONSTRAINT "courses_pdfs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workshops_images" ADD CONSTRAINT "workshops_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshops_images" ADD CONSTRAINT "workshops_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workshops_pdfs" ADD CONSTRAINT "workshops_pdfs_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workshops_pdfs" ADD CONSTRAINT "workshops_pdfs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workshops_rels" ADD CONSTRAINT "workshops_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workshops_rels" ADD CONSTRAINT "workshops_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_blocks_question_options" ADD CONSTRAINT "quizzes_blocks_question_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_blocks_question"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_blocks_question" ADD CONSTRAINT "quizzes_blocks_question_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_blocks_question" ADD CONSTRAINT "quizzes_blocks_question_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_texts" ADD CONSTRAINT "quizzes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "daily_quizzes_options" ADD CONSTRAINT "daily_quizzes_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."daily_quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "daily_quizzes" ADD CONSTRAINT "daily_quizzes_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "daily_quizzes" ADD CONSTRAINT "daily_quizzes_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "daily_quizzes_texts" ADD CONSTRAINT "daily_quizzes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."daily_quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_interests" ADD CONSTRAINT "feedback_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_lead_history" ADD CONSTRAINT "leads_lead_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_rich_text_block" ADD CONSTRAINT "lessons_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_video_block" ADD CONSTRAINT "lessons_blocks_video_block_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_video_block" ADD CONSTRAINT "lessons_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_quiz_block" ADD CONSTRAINT "lessons_blocks_quiz_block_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_quiz_block" ADD CONSTRAINT "lessons_blocks_quiz_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_pdf_block" ADD CONSTRAINT "lessons_blocks_pdf_block_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_pdf_block" ADD CONSTRAINT "lessons_blocks_pdf_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_topics_resources" ADD CONSTRAINT "lessons_topics_resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_topics_resources" ADD CONSTRAINT "lessons_topics_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_topics" ADD CONSTRAINT "lessons_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_batches_fk" FOREIGN KEY ("batches_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workshops_fk" FOREIGN KEY ("workshops_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_daily_quizzes_fk" FOREIGN KEY ("daily_quizzes_id") REFERENCES "public"."daily_quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_problems_fk" FOREIGN KEY ("problems_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_modules_fk" FOREIGN KEY ("course_modules_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_progress_fk" FOREIGN KEY ("course_progress_id") REFERENCES "public"."course_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_batch_idx" ON "users" USING btree ("batch_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE INDEX "courses_images_order_idx" ON "courses_images" USING btree ("_order");
  CREATE INDEX "courses_images_parent_id_idx" ON "courses_images" USING btree ("_parent_id");
  CREATE INDEX "courses_images_image_idx" ON "courses_images" USING btree ("image_id");
  CREATE INDEX "courses_pdfs_order_idx" ON "courses_pdfs" USING btree ("_order");
  CREATE INDEX "courses_pdfs_parent_id_idx" ON "courses_pdfs" USING btree ("_parent_id");
  CREATE INDEX "courses_pdfs_pdf_idx" ON "courses_pdfs" USING btree ("pdf_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE UNIQUE INDEX "batches_slug_idx" ON "batches" USING btree ("slug");
  CREATE INDEX "batches_updated_at_idx" ON "batches" USING btree ("updated_at");
  CREATE INDEX "batches_created_at_idx" ON "batches" USING btree ("created_at");
  CREATE INDEX "batches_rels_order_idx" ON "batches_rels" USING btree ("order");
  CREATE INDEX "batches_rels_parent_idx" ON "batches_rels" USING btree ("parent_id");
  CREATE INDEX "batches_rels_path_idx" ON "batches_rels" USING btree ("path");
  CREATE INDEX "batches_rels_courses_id_idx" ON "batches_rels" USING btree ("courses_id");
  CREATE INDEX "batches_rels_users_id_idx" ON "batches_rels" USING btree ("users_id");
  CREATE INDEX "workshops_images_order_idx" ON "workshops_images" USING btree ("_order");
  CREATE INDEX "workshops_images_parent_id_idx" ON "workshops_images" USING btree ("_parent_id");
  CREATE INDEX "workshops_images_image_idx" ON "workshops_images" USING btree ("image_id");
  CREATE INDEX "workshops_pdfs_order_idx" ON "workshops_pdfs" USING btree ("_order");
  CREATE INDEX "workshops_pdfs_parent_id_idx" ON "workshops_pdfs" USING btree ("_parent_id");
  CREATE INDEX "workshops_pdfs_pdf_idx" ON "workshops_pdfs" USING btree ("pdf_id");
  CREATE UNIQUE INDEX "workshops_slug_idx" ON "workshops" USING btree ("slug");
  CREATE INDEX "workshops_updated_at_idx" ON "workshops" USING btree ("updated_at");
  CREATE INDEX "workshops_created_at_idx" ON "workshops" USING btree ("created_at");
  CREATE INDEX "workshops_rels_order_idx" ON "workshops_rels" USING btree ("order");
  CREATE INDEX "workshops_rels_parent_idx" ON "workshops_rels" USING btree ("parent_id");
  CREATE INDEX "workshops_rels_path_idx" ON "workshops_rels" USING btree ("path");
  CREATE INDEX "workshops_rels_users_id_idx" ON "workshops_rels" USING btree ("users_id");
  CREATE INDEX "quizzes_blocks_question_options_order_idx" ON "quizzes_blocks_question_options" USING btree ("_order");
  CREATE INDEX "quizzes_blocks_question_options_parent_id_idx" ON "quizzes_blocks_question_options" USING btree ("_parent_id");
  CREATE INDEX "quizzes_blocks_question_order_idx" ON "quizzes_blocks_question" USING btree ("_order");
  CREATE INDEX "quizzes_blocks_question_parent_id_idx" ON "quizzes_blocks_question" USING btree ("_parent_id");
  CREATE INDEX "quizzes_blocks_question_path_idx" ON "quizzes_blocks_question" USING btree ("_path");
  CREATE INDEX "quizzes_blocks_question_image_idx" ON "quizzes_blocks_question" USING btree ("image_id");
  CREATE INDEX "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE INDEX "quizzes_texts_order_parent" ON "quizzes_texts" USING btree ("order","parent_id");
  CREATE INDEX "daily_quizzes_options_order_idx" ON "daily_quizzes_options" USING btree ("_order");
  CREATE INDEX "daily_quizzes_options_parent_id_idx" ON "daily_quizzes_options" USING btree ("_parent_id");
  CREATE INDEX "daily_quizzes_batch_idx" ON "daily_quizzes" USING btree ("batch_id");
  CREATE INDEX "daily_quizzes_module_idx" ON "daily_quizzes" USING btree ("module_id");
  CREATE INDEX "daily_quizzes_updated_at_idx" ON "daily_quizzes" USING btree ("updated_at");
  CREATE INDEX "daily_quizzes_created_at_idx" ON "daily_quizzes" USING btree ("created_at");
  CREATE INDEX "daily_quizzes_texts_order_parent" ON "daily_quizzes_texts" USING btree ("order","parent_id");
  CREATE INDEX "problems_updated_at_idx" ON "problems" USING btree ("updated_at");
  CREATE INDEX "problems_created_at_idx" ON "problems" USING btree ("created_at");
  CREATE INDEX "sessions_quiz_idx" ON "sessions" USING btree ("quiz_id");
  CREATE INDEX "sessions_host_idx" ON "sessions" USING btree ("host_id");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "feedback_interests_order_idx" ON "feedback_interests" USING btree ("_order");
  CREATE INDEX "feedback_interests_parent_id_idx" ON "feedback_interests" USING btree ("_parent_id");
  CREATE INDEX "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE INDEX "leads_lead_history_order_idx" ON "leads_lead_history" USING btree ("_order");
  CREATE INDEX "leads_lead_history_parent_id_idx" ON "leads_lead_history" USING btree ("_parent_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");
  CREATE INDEX "course_modules_updated_at_idx" ON "course_modules" USING btree ("updated_at");
  CREATE INDEX "course_modules_created_at_idx" ON "course_modules" USING btree ("created_at");
  CREATE INDEX "lessons_blocks_rich_text_block_order_idx" ON "lessons_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_rich_text_block_parent_id_idx" ON "lessons_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_rich_text_block_path_idx" ON "lessons_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_video_block_order_idx" ON "lessons_blocks_video_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_video_block_parent_id_idx" ON "lessons_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_video_block_path_idx" ON "lessons_blocks_video_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_video_block_video_idx" ON "lessons_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "lessons_blocks_quiz_block_order_idx" ON "lessons_blocks_quiz_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_quiz_block_parent_id_idx" ON "lessons_blocks_quiz_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_quiz_block_path_idx" ON "lessons_blocks_quiz_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_quiz_block_quiz_idx" ON "lessons_blocks_quiz_block" USING btree ("quiz_id");
  CREATE INDEX "lessons_blocks_pdf_block_order_idx" ON "lessons_blocks_pdf_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_pdf_block_parent_id_idx" ON "lessons_blocks_pdf_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_pdf_block_path_idx" ON "lessons_blocks_pdf_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_pdf_block_file_idx" ON "lessons_blocks_pdf_block" USING btree ("file_id");
  CREATE INDEX "lessons_topics_resources_order_idx" ON "lessons_topics_resources" USING btree ("_order");
  CREATE INDEX "lessons_topics_resources_parent_id_idx" ON "lessons_topics_resources" USING btree ("_parent_id");
  CREATE INDEX "lessons_topics_resources_file_idx" ON "lessons_topics_resources" USING btree ("file_id");
  CREATE INDEX "lessons_topics_order_idx" ON "lessons_topics" USING btree ("_order");
  CREATE INDEX "lessons_topics_parent_id_idx" ON "lessons_topics" USING btree ("_parent_id");
  CREATE INDEX "lessons_module_idx" ON "lessons" USING btree ("module_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "course_progress_user_idx" ON "course_progress" USING btree ("user_id");
  CREATE INDEX "course_progress_course_idx" ON "course_progress" USING btree ("course_id");
  CREATE INDEX "course_progress_lesson_idx" ON "course_progress" USING btree ("lesson_id");
  CREATE INDEX "course_progress_updated_at_idx" ON "course_progress" USING btree ("updated_at");
  CREATE INDEX "course_progress_created_at_idx" ON "course_progress" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_batches_id_idx" ON "payload_locked_documents_rels" USING btree ("batches_id");
  CREATE INDEX "payload_locked_documents_rels_workshops_id_idx" ON "payload_locked_documents_rels" USING btree ("workshops_id");
  CREATE INDEX "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_daily_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("daily_quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_problems_id_idx" ON "payload_locked_documents_rels" USING btree ("problems_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_course_modules_id_idx" ON "payload_locked_documents_rels" USING btree ("course_modules_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_course_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("course_progress_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "courses_images" CASCADE;
  DROP TABLE "courses_pdfs" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "batches" CASCADE;
  DROP TABLE "batches_rels" CASCADE;
  DROP TABLE "workshops_images" CASCADE;
  DROP TABLE "workshops_pdfs" CASCADE;
  DROP TABLE "workshops" CASCADE;
  DROP TABLE "workshops_rels" CASCADE;
  DROP TABLE "quizzes_blocks_question_options" CASCADE;
  DROP TABLE "quizzes_blocks_question" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "quizzes_texts" CASCADE;
  DROP TABLE "daily_quizzes_options" CASCADE;
  DROP TABLE "daily_quizzes" CASCADE;
  DROP TABLE "daily_quizzes_texts" CASCADE;
  DROP TABLE "problems" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "feedback_interests" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "leads_lead_history" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "course_modules" CASCADE;
  DROP TABLE "lessons_blocks_rich_text_block" CASCADE;
  DROP TABLE "lessons_blocks_video_block" CASCADE;
  DROP TABLE "lessons_blocks_quiz_block" CASCADE;
  DROP TABLE "lessons_blocks_pdf_block" CASCADE;
  DROP TABLE "lessons_topics_resources" CASCADE;
  DROP TABLE "lessons_topics" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "course_progress" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_batches_status";
  DROP TYPE "public"."enum_quizzes_blocks_question_type";
  DROP TYPE "public"."enum_daily_quizzes_type";
  DROP TYPE "public"."enum_problems_difficulty";
  DROP TYPE "public"."enum_sessions_status";
  DROP TYPE "public"."enum_sessions_mode";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_lessons_blocks_video_block_video_source";
  DROP TYPE "public"."enum_course_progress_status";`)
}
