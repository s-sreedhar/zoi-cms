import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Remove temp_trigger from lessons
  await db.execute(sql`ALTER TABLE "lessons" DROP COLUMN IF EXISTS "temp_trigger"`)

  // Step 2: Add batch columns to course-modules, lessons, and lesson-notes
  await db.execute(sql`ALTER TABLE "course_modules" ADD COLUMN IF NOT EXISTS "batch" integer[]`)
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "batch" integer[]`)
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "batch_id" integer`)

  // Step 3: Add foreign key for lesson_notes batch
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lesson_notes_batch_id_batches_id_fk'
      ) THEN
        ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_batch_id_batches_id_fk" 
          FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`)

  // Step 4: Convert lesson_notes content from text to richText
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "content_rich" jsonb`)

  await db.execute(sql`
   UPDATE "lesson_notes" 
   SET "content_rich" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("content", ''))
       )
     )
   )
   WHERE "content" IS NOT NULL AND "content_rich" IS NULL`)

  await db.execute(sql`ALTER TABLE "lesson_notes" DROP COLUMN IF EXISTS "content"`)
  await db.execute(sql`ALTER TABLE "lesson_notes" RENAME COLUMN "content_rich" TO "content"`)

  // Step 5: Add NOT NULL constraint back to content
  await db.execute(sql`ALTER TABLE "lesson_notes" ALTER COLUMN "content" SET NOT NULL`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reverse: Convert richText back to text
  await db.execute(sql`ALTER TABLE "lesson_notes" ADD COLUMN IF NOT EXISTS "content_text" text`)
  await db.execute(sql`UPDATE "lesson_notes" SET "content_text" = "content"->0->'children'->0->>'text' WHERE "content" IS NOT NULL`)
  await db.execute(sql`ALTER TABLE "lesson_notes" DROP COLUMN IF EXISTS "content"`)
  await db.execute(sql`ALTER TABLE "lesson_notes" RENAME COLUMN "content_text" TO "content"`)

  // Remove batch columns
  await db.execute(sql`ALTER TABLE "lesson_notes" DROP CONSTRAINT IF EXISTS "lesson_notes_batch_id_batches_id_fk"`)
  await db.execute(sql`ALTER TABLE "course_modules" DROP COLUMN IF EXISTS "batch"`)
  await db.execute(sql`ALTER TABLE "lessons" DROP COLUMN IF EXISTS "batch"`)
  await db.execute(sql`ALTER TABLE "lesson_notes" DROP COLUMN IF EXISTS "batch_id"`)

  // Re-add temp_trigger
  await db.execute(sql`ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "temp_trigger" text`)
}
