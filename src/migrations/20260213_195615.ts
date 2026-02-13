import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Drop testCases column
  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "test_cases"`)

  // Step 2: Add temporary columns for richText versions
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "template_rich" jsonb`)
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "testbench_rich" jsonb`)

  // Step 3: Convert existing text to richText format
  await db.execute(sql`
   UPDATE "problems" 
   SET "template_rich" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("template", ''))
       )
     )
   )
   WHERE "template" IS NOT NULL AND "template_rich" IS NULL`)

  await db.execute(sql`
   UPDATE "problems" 
   SET "testbench_rich" = jsonb_build_array(
     jsonb_build_object(
       'children', jsonb_build_array(
         jsonb_build_object('text', COALESCE("testbench", ''))
       )
     )
   )
   WHERE "testbench" IS NOT NULL AND "testbench_rich" IS NULL`)

  // Step 4: Drop old columns and rename new ones
  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "template"`)
  await db.execute(sql`ALTER TABLE "problems" RENAME COLUMN "template_rich" TO "template"`)

  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "testbench"`)
  await db.execute(sql`ALTER TABLE "problems" RENAME COLUMN "testbench_rich" TO "testbench"`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Convert richText back to plain text
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "template_text" text`)
  await db.execute(sql`UPDATE "problems" SET "template_text" = "template"->0->'children'->0->>'text' WHERE "template" IS NOT NULL`)
  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "template"`)
  await db.execute(sql`ALTER TABLE "problems" RENAME COLUMN "template_text" TO "template"`)

  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "testbench_text" text`)
  await db.execute(sql`UPDATE "problems" SET "testbench_text" = "testbench"->0->'children'->0->>'text' WHERE "testbench" IS NOT NULL`)
  await db.execute(sql`ALTER TABLE "problems" DROP COLUMN IF EXISTS "testbench"`)
  await db.execute(sql`ALTER TABLE "problems" RENAME COLUMN "testbench_text" TO "testbench"`)

  // Re-add testCases column
  await db.execute(sql`ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "test_cases" jsonb`)
}
