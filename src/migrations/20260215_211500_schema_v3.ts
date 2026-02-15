import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    -- 1. ENUMS (Safe creation)
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_workshops_status') THEN 
            CREATE TYPE "public"."enum_workshops_status" AS ENUM('upcoming', 'open', 'closed'); 
        END IF;
    END $$;

    -- 2. WORKSHOPS COLUMNS
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "title" varchar NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "status" "enum_workshops_status" DEFAULT 'upcoming' NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "slug" varchar NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "description" varchar NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "start_date" timestamp(3) with time zone NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "venue" varchar DEFAULT 'Online' NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "end_date" timestamp(3) with time zone;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
    ALTER TABLE "workshops" ADD COLUMN IF NOT EXISTS "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
    
    CREATE UNIQUE INDEX IF NOT EXISTS "workshops_slug_idx" ON "workshops" USING btree ("slug");

    -- 3. COURSES COLUMNS
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "title" varchar NOT NULL;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "slug" varchar NOT NULL;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "description" jsonb NOT NULL;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS "courses_slug_idx" ON "courses" USING btree ("slug");

    -- 4. BATCHES COLUMNS
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "name" varchar NOT NULL;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "slug" varchar NOT NULL;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "status" "enum_batches_status" DEFAULT 'upcoming' NOT NULL;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "start_date" timestamp(3) with time zone;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "end_date" timestamp(3) with time zone;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "duration" varchar;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "price" numeric NOT NULL;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "gst" numeric DEFAULT 18;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "original_price" numeric;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "offer_title" varchar;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "offer_details" varchar;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "syllabus" jsonb;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "curriculum" jsonb;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
    ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS "batches_slug_idx" ON "batches" USING btree ("slug");

    -- 5. RELATIONSHIP TABLES COLUMNS
    -- workshops_rels
    ALTER TABLE "workshops_rels" ADD COLUMN IF NOT EXISTS "order" integer;
    ALTER TABLE "workshops_rels" ADD COLUMN IF NOT EXISTS "parent_id" integer;
    ALTER TABLE "workshops_rels" ADD COLUMN IF NOT EXISTS "path" varchar;
    ALTER TABLE "workshops_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;

    -- batches_rels
    ALTER TABLE "batches_rels" ADD COLUMN IF NOT EXISTS "order" integer;
    ALTER TABLE "batches_rels" ADD COLUMN IF NOT EXISTS "parent_id" integer;
    ALTER TABLE "batches_rels" ADD COLUMN IF NOT EXISTS "path" varchar;
    ALTER TABLE "batches_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;
    ALTER TABLE "batches_rels" ADD COLUMN IF NOT EXISTS "courses_id" integer;

    -- courses_images
    ALTER TABLE "courses_images" ADD COLUMN IF NOT EXISTS "_order" integer NOT NULL;
    ALTER TABLE "courses_images" ADD COLUMN IF NOT EXISTS "_parent_id" integer NOT NULL;
    ALTER TABLE "courses_images" ADD COLUMN IF NOT EXISTS "image_id" integer;

    -- courses_pdfs
    ALTER TABLE "courses_pdfs" ADD COLUMN IF NOT EXISTS "_order" integer NOT NULL;
    ALTER TABLE "courses_pdfs" ADD COLUMN IF NOT EXISTS "_parent_id" integer NOT NULL;
    ALTER TABLE "courses_pdfs" ADD COLUMN IF NOT EXISTS "pdf_id" integer;

    -- workshops_images
    ALTER TABLE "workshops_images" ADD COLUMN IF NOT EXISTS "_order" integer NOT NULL;
    ALTER TABLE "workshops_images" ADD COLUMN IF NOT EXISTS "_parent_id" integer NOT NULL;
    ALTER TABLE "workshops_images" ADD COLUMN IF NOT EXISTS "image_id" integer;

    -- workshops_pdfs
    ALTER TABLE "workshops_pdfs" ADD COLUMN IF NOT EXISTS "_order" integer NOT NULL;
    ALTER TABLE "workshops_pdfs" ADD COLUMN IF NOT EXISTS "_parent_id" integer NOT NULL;
    ALTER TABLE "workshops_pdfs" ADD COLUMN IF NOT EXISTS "pdf_id" integer;

    -- 6. CONSTRAINTS
    DO $$ BEGIN
        -- Workshops Rels
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshops_rels_parent_fk') THEN
            ALTER TABLE "workshops_rels" ADD CONSTRAINT "workshops_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshops_rels_users_fk') THEN
            ALTER TABLE "workshops_rels" ADD CONSTRAINT "workshops_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        END IF;

        -- Batches Rels
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_rels_parent_fk') THEN
            ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_rels_users_fk') THEN
            ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_rels_courses_fk') THEN
            ALTER TABLE "batches_rels" ADD CONSTRAINT "batches_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
        END IF;

        -- Courses Array Tables
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_images_parent_id_fk') THEN
            ALTER TABLE "courses_images" ADD CONSTRAINT "courses_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_images_image_id_fk') THEN
            ALTER TABLE "courses_images" ADD CONSTRAINT "courses_images_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
        END IF;
        
        -- Workshops Array Tables
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshops_images_parent_id_fk') THEN
            ALTER TABLE "workshops_images" ADD CONSTRAINT "workshops_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Not implemented
}
