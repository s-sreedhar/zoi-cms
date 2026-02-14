import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    console.log('[MIGRATION] Fixing malformed Lexical JSON structures...')

    // Fix lesson_notes.content
    // Check if data exists and is malformed (missing root.type)
    await db.execute(sql`
    UPDATE "lesson_notes"
    SET "content" = jsonb_build_object(
      'root', jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', COALESCE("content"->0->'children'->0->>'text', ''),
                'version', 1
              )
            ),
            'version', 1
          )
        ),
        'version', 1
      )
    )
    WHERE "content" IS NOT NULL 
      AND "content"->>'root' IS NULL
  `)

    // Fix quizzes.description
    await db.execute(sql`
    UPDATE "quizzes"
    SET "description" = jsonb_build_object(
      'root', jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', COALESCE("description"->0->'children'->0->>'text', ''),
                'version', 1
              )
            ),
            'version', 1
          )
        ),
        'version', 1
      )
    )
    WHERE "description" IS NOT NULL 
      AND "description"->>'root' IS NULL
  `)

    // Fix problems.template
    await db.execute(sql`
    UPDATE "problems"
    SET "template" = jsonb_build_object(
      'root', jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', COALESCE("template"->0->'children'->0->>'text', ''),
                'version', 1
              )
            ),
            'version', 1
          )
        ),
        'version', 1
      )
    )
    WHERE "template" IS NOT NULL 
      AND "template"->>'root' IS NULL
  `)

    // Fix problems.testbench
    await db.execute(sql`
    UPDATE "problems"
    SET "testbench" = jsonb_build_object(
      'root', jsonb_build_object(
        'type', 'root',
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', COALESCE("testbench"->0->'children'->0->>'text', ''),
                'version', 1
              )
            ),
            'version', 1
          )
        ),
        'version', 1
      )
    )
    WHERE "testbench" IS NOT NULL 
      AND "testbench"->>'root' IS NULL
  `)

    console.log('[MIGRATION] Lexical JSON structures fixed successfully')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    console.log('[MIGRATION] Reverting Lexical JSON structure fixes...')

    // Revert lesson_notes.content
    await db.execute(sql`
    UPDATE "lesson_notes"
    SET "content" = jsonb_build_array(
      jsonb_build_object(
        'children', jsonb_build_array(
          jsonb_build_object('text', COALESCE("content"->'root'->'children'->0->'children'->0->>'text', ''))
        )
      )
    )
    WHERE "content" IS NOT NULL 
      AND "content"->>'root' IS NOT NULL
  `)

    // Revert quizzes.description
    await db.execute(sql`
    UPDATE "quizzes"
    SET "description" = jsonb_build_array(
      jsonb_build_object(
        'children', jsonb_build_array(
          jsonb_build_object('text', COALESCE("description"->'root'->'children'->0->'children'->0->>'text', ''))
        )
      )
    )
    WHERE "description" IS NOT NULL 
      AND "description"->>'root' IS NOT NULL
  `)

    // Revert problems.template
    await db.execute(sql`
    UPDATE "problems"
    SET "template" = jsonb_build_array(
      jsonb_build_object(
        'children', jsonb_build_array(
          jsonb_build_object('text', COALESCE("template"->'root'->'children'->0->'children'->0->>'text', ''))
        )
      )
    )
    WHERE "template" IS NOT NULL 
      AND "template"->>'root' IS NOT NULL
  `)

    // Revert problems.testbench
    await db.execute(sql`
    UPDATE "problems"
    SET "testbench" = jsonb_build_array(
      jsonb_build_object(
        'children', jsonb_build_array(
          jsonb_build_object('text', COALESCE("testbench"->'root'->'children'->0->'children'->0->>'text', ''))
        )
      )
    )
    WHERE "testbench" IS NOT NULL 
      AND "testbench"->>'root' IS NOT NULL
  `)

    console.log('[MIGRATION] Lexical JSON structure fixes reverted')
}
