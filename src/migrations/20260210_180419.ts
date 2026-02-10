import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feedback_difficulty" AS ENUM('Easy', 'Medium', 'Hard', 'Very Hard');
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "batches_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "batches_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "problems_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer
  );
  
  ALTER TABLE "batches" ADD COLUMN "syllabus" jsonb;
  ALTER TABLE "batches" ADD COLUMN "curriculum" jsonb;
  ALTER TABLE "feedback" ADD COLUMN "quiz_id" varchar;
  ALTER TABLE "feedback" ADD COLUMN "session_id" varchar;
  ALTER TABLE "feedback" ADD COLUMN "difficulty" "enum_feedback_difficulty";
  ALTER TABLE "feedback" ADD COLUMN "gift_preference" varchar;
  ALTER TABLE "feedback" ADD COLUMN "contact_name" varchar;
  ALTER TABLE "feedback" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "feedback" ADD COLUMN "place" varchar;
  ALTER TABLE "feedback" ADD COLUMN "how_did_you_find_us" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "companies_id" integer;
  ALTER TABLE "batches_images" ADD CONSTRAINT "batches_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "batches_images" ADD CONSTRAINT "batches_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "batches_documents" ADD CONSTRAINT "batches_documents_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "batches_documents" ADD CONSTRAINT "batches_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_rels" ADD CONSTRAINT "problems_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_rels" ADD CONSTRAINT "problems_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "companies_name_idx" ON "companies" USING btree ("name");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "batches_images_order_idx" ON "batches_images" USING btree ("_order");
  CREATE INDEX "batches_images_parent_id_idx" ON "batches_images" USING btree ("_parent_id");
  CREATE INDEX "batches_images_image_idx" ON "batches_images" USING btree ("image_id");
  CREATE INDEX "batches_documents_order_idx" ON "batches_documents" USING btree ("_order");
  CREATE INDEX "batches_documents_parent_id_idx" ON "batches_documents" USING btree ("_parent_id");
  CREATE INDEX "batches_documents_document_idx" ON "batches_documents" USING btree ("document_id");
  CREATE INDEX "problems_rels_order_idx" ON "problems_rels" USING btree ("order");
  CREATE INDEX "problems_rels_parent_idx" ON "problems_rels" USING btree ("parent_id");
  CREATE INDEX "problems_rels_path_idx" ON "problems_rels" USING btree ("path");
  CREATE INDEX "problems_rels_companies_id_idx" ON "problems_rels" USING btree ("companies_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "feedback_session_id_idx" ON "feedback" USING btree ("session_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  ALTER TABLE "workshops" DROP COLUMN "instructor";
  ALTER TABLE "workshops" DROP COLUMN "price";
  ALTER TABLE "workshops" DROP COLUMN "place";
  ALTER TABLE "workshops" DROP COLUMN "preset_college";
  ALTER TABLE "workshops" DROP COLUMN "hidden";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "batches_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "batches_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problems_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "batches_images" CASCADE;
  DROP TABLE "batches_documents" CASCADE;
  DROP TABLE "problems_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_companies_fk";
  
  DROP INDEX "feedback_session_id_idx";
  DROP INDEX "payload_locked_documents_rels_companies_id_idx";
  ALTER TABLE "workshops" ADD COLUMN "instructor" varchar;
  ALTER TABLE "workshops" ADD COLUMN "price" numeric;
  ALTER TABLE "workshops" ADD COLUMN "place" varchar;
  ALTER TABLE "workshops" ADD COLUMN "preset_college" varchar;
  ALTER TABLE "workshops" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "batches" DROP COLUMN "syllabus";
  ALTER TABLE "batches" DROP COLUMN "curriculum";
  ALTER TABLE "feedback" DROP COLUMN "quiz_id";
  ALTER TABLE "feedback" DROP COLUMN "session_id";
  ALTER TABLE "feedback" DROP COLUMN "difficulty";
  ALTER TABLE "feedback" DROP COLUMN "gift_preference";
  ALTER TABLE "feedback" DROP COLUMN "contact_name";
  ALTER TABLE "feedback" DROP COLUMN "contact_phone";
  ALTER TABLE "feedback" DROP COLUMN "place";
  ALTER TABLE "feedback" DROP COLUMN "how_did_you_find_us";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "companies_id";
  DROP TYPE "public"."enum_feedback_difficulty";`)
}
