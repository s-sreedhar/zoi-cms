import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add slug columns
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "slug" varchar`)

  // Step 2: Add new description_rich column for quizzes
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "description_rich" jsonb`)

  // Step 3: Convert existing text descriptions to richText format
  await db.execute(sql`
   UPDATE "quizzes" 
   SET "description_rich" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("description", ''))
       )
     )
   )
   WHERE "description" IS NOT NULL AND "description_rich" IS NULL`)

  // Step 4: Drop old description column and rename new one
  await db.execute(sql`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "description"`)
  await db.execute(sql`ALTER TABLE "quizzes" RENAME COLUMN "description_rich" TO "description"`)

  // Step 5: Add description column to daily_quizzes (new column, no data to migrate)
  await db.execute(sql`ALTER TABLE "daily_quizzes" ADD COLUMN IF NOT EXISTS "description" jsonb`)

  // Step 6: Add sessions batch_id column
  await db.execute(sql`ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "batch_id" integer`)

  // Step 7: Add foreign key constraint (check if exists first)
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sessions_batch_id_batches_id_fk'
      ) THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_batch_id_batches_id_fk" 
          FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`)

  // Step 8: Create indexes
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "quizzes_slug_idx" ON "quizzes" USING btree ("slug")`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "daily_quizzes_slug_idx" ON "daily_quizzes" USING btree ("slug")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "sessions_batch_idx" ON "sessions" USING btree ("batch_id")`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_batch_id_batches_id_fk"`)
  await db.execute(sql`DROP INDEX IF EXISTS "quizzes_slug_idx"`)
  await db.execute(sql`DROP INDEX IF EXISTS "daily_quizzes_slug_idx"`)
  await db.execute(sql`DROP INDEX IF EXISTS "sessions_batch_idx"`)

  // Convert richText back to plain text
  await db.execute(sql`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "description_text" varchar`)
  await db.execute(sql`UPDATE "quizzes" SET "description_text" = "description"->0->'children'->0->>'text' WHERE "description" IS NOT NULL`)
  await db.execute(sql`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "description"`)
  await db.execute(sql`ALTER TABLE "quizzes" RENAME COLUMN "description_text" TO "description"`)

  await db.execute(sql`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "slug"`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" DROP COLUMN IF EXISTS "slug"`)
  await db.execute(sql`ALTER TABLE "daily_quizzes" DROP COLUMN IF EXISTS "description"`)
  await db.execute(sql`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "batch_id"`)
}
