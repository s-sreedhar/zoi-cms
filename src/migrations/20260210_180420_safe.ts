import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_feedback_difficulty" AS ENUM('Easy', 'Medium', 'Hard', 'Very Hard');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE TABLE IF NOT EXISTS "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );
  
   CREATE TABLE IF NOT EXISTS "batches_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
   );
  
   CREATE TABLE IF NOT EXISTS "batches_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
   );
  
   CREATE TABLE IF NOT EXISTS "problems_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer
   );
  
   ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "syllabus" jsonb;
   ALTER TABLE "batches" ADD COLUMN IF NOT EXISTS "curriculum" jsonb;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "quiz_id" varchar;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "session_id" varchar;
   DO $$ BEGIN
    ALTER TABLE "feedback" ADD COLUMN "difficulty" "enum_feedback_difficulty";
   EXCEPTION
    WHEN duplicate_column THEN null;
   END $$;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "gift_preference" varchar;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "contact_name" varchar;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "contact_phone" varchar;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "place" varchar;
   ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "how_did_you_find_us" varchar;
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "companies_id" integer;

   DO $$ BEGIN
    ALTER TABLE "batches_images" ADD CONSTRAINT "batches_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "batches_images" ADD CONSTRAINT "batches_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "batches_documents" ADD CONSTRAINT "batches_documents_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "batches_documents" ADD CONSTRAINT "batches_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "problems_rels" ADD CONSTRAINT "problems_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "problems_rels" ADD CONSTRAINT "problems_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE UNIQUE INDEX IF NOT EXISTS "companies_name_idx" ON "companies" USING btree ("name");
   CREATE INDEX IF NOT EXISTS "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "companies_created_at_idx" ON "companies" USING btree ("created_at");
   CREATE INDEX IF NOT EXISTS "batches_images_order_idx" ON "batches_images" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "batches_images_parent_id_idx" ON "batches_images" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "batches_images_image_idx" ON "batches_images" USING btree ("image_id");
   CREATE INDEX IF NOT EXISTS "batches_documents_order_idx" ON "batches_documents" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "batches_documents_parent_id_idx" ON "batches_documents" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "batches_documents_document_idx" ON "batches_documents" USING btree ("document_id");
   CREATE INDEX IF NOT EXISTS "problems_rels_order_idx" ON "problems_rels" USING btree ("order");
   CREATE INDEX IF NOT EXISTS "problems_rels_parent_idx" ON "problems_rels" USING btree ("parent_id");
   CREATE INDEX IF NOT EXISTS "problems_rels_path_idx" ON "problems_rels" USING btree ("path");
   CREATE INDEX IF NOT EXISTS "problems_rels_companies_id_idx" ON "problems_rels" USING btree ("companies_id");

   DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE INDEX IF NOT EXISTS "feedback_session_id_idx" ON "feedback" USING btree ("session_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
   
   ALTER TABLE "workshops" DROP COLUMN IF EXISTS "instructor";
   ALTER TABLE "workshops" DROP COLUMN IF EXISTS "price";
   ALTER TABLE "workshops" DROP COLUMN IF EXISTS "place";
   ALTER TABLE "workshops" DROP COLUMN IF EXISTS "preset_college";
   ALTER TABLE "workshops" DROP COLUMN IF EXISTS "hidden";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Down migration left empty intentionally to avoid data loss during troubleshooting
}
