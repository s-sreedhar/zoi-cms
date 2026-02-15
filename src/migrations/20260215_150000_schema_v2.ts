import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    CREATE TYPE "public"."enum_announcements_type" AS ENUM('info', 'alert', 'success');
    CREATE TYPE "public"."enum_announcements_target" AS ENUM('all', 'batch');
    CREATE TYPE "public"."enum_workshops_status" AS ENUM('upcoming', 'open', 'closed');
    CREATE TYPE "public"."enum_workshop_registrations_how_did_you_know" AS ENUM('social_media', 'friend', 'college', 'other');
    CREATE TYPE "public"."enum_lessons_blocks_video_block_video_source" AS ENUM('bunny', 'youtube', 'custom');

    -- Tables that might be missing from consolidated_state
    CREATE TABLE IF NOT EXISTS "announcements" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "message" varchar NOT NULL,
        "type" "enum_announcements_type" DEFAULT 'info' NOT NULL,
        "target" "enum_announcements_target" DEFAULT 'all' NOT NULL,
        "batch_id" integer,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "workshop_registrations" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "roll_number" varchar NOT NULL,
        "email" varchar NOT NULL,
        "how_did_you_know" "enum_workshop_registrations_how_did_you_know" NOT NULL,
        "workshop_id" integer NOT NULL,
        "venue" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "companies" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Ensure Columns for existsing tables (v2 Sync)
    DO $$ 
    BEGIN 
        -- Add missing columns to Users
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN
            ALTER TABLE "users" ADD COLUMN "google_id" varchar;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='image_url') THEN
            ALTER TABLE "users" ADD COLUMN "image_url" varchar;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='streak') THEN
            ALTER TABLE "users" ADD COLUMN "streak" numeric DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='points') THEN
            ALTER TABLE "users" ADD COLUMN "points" numeric DEFAULT 0;
        END IF;
    END $$;

    -- Add FKs for new tables
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_batch_id_batches_id_fk') THEN
            ALTER TABLE "announcements" ADD CONSTRAINT "announcements_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_registrations_workshop_id_workshops_id_fk') THEN
            ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE no action;
        END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Not implemented for sync migration
}
