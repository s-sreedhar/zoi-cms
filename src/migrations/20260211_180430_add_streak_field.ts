import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_announcements_type" AS ENUM('info', 'alert', 'success');
  CREATE TYPE "public"."enum_announcements_target" AS ENUM('all', 'batch');
  CREATE TYPE "public"."enum_workshops_status" AS ENUM('upcoming', 'open', 'closed');
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"type" "enum_announcements_type" DEFAULT 'info' NOT NULL,
  	"target" "enum_announcements_target" DEFAULT 'all' NOT NULL,
  	"batch_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE INDEX "lesson_notes_lesson_idx" ON "lesson_notes" USING btree ("lesson_id");
  CREATE INDEX "lesson_notes_updated_at_idx" ON "lesson_notes" USING btree ("updated_at");
  CREATE INDEX "lesson_notes_created_at_idx" ON "lesson_notes" USING btree ("created_at");
  ALTER TABLE "daily_quizzes" ADD CONSTRAINT "daily_quizzes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lesson_notes_fk" FOREIGN KEY ("lesson_notes_id") REFERENCES "public"."lesson_notes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "daily_quizzes_image_idx" ON "daily_quizzes" USING btree ("image_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_lesson_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_notes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "announcements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lesson_notes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "lesson_notes" CASCADE;
  ALTER TABLE "daily_quizzes" DROP CONSTRAINT "daily_quizzes_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_announcements_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lesson_notes_fk";
  
  DROP INDEX "daily_quizzes_image_idx";
  DROP INDEX "payload_locked_documents_rels_announcements_id_idx";
  DROP INDEX "payload_locked_documents_rels_lesson_notes_id_idx";
  ALTER TABLE "users" DROP COLUMN "streak";
  ALTER TABLE "users" DROP COLUMN "points";
  ALTER TABLE "users" DROP COLUMN "last_quiz_date";
  ALTER TABLE "users" DROP COLUMN "active_session_id";
  ALTER TABLE "users" DROP COLUMN "last_i_p";
  ALTER TABLE "users" DROP COLUMN "last_login";
  ALTER TABLE "workshops" DROP COLUMN "status";
  ALTER TABLE "daily_quizzes" DROP COLUMN "image_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "announcements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lesson_notes_id";
  DROP TYPE "public"."enum_announcements_type";
  DROP TYPE "public"."enum_announcements_target";
  DROP TYPE "public"."enum_workshops_status";`)
}
