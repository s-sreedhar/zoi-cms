import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanup() {
    const client = await pool.connect();
    try {
        console.log('Dropping ALL relevant tables to force clean schema sync...');

        // Drop relationships
        await client.query(`DROP TABLE IF EXISTS "batches_rels" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "courses_rels" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "courses_images" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "courses_pdfs" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "lessons_topics" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "lessons_topics_resources" CASCADE`);

        // Drop main collections
        await client.query(`DROP TABLE IF EXISTS "batches" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "courses" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "lessons" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "course_modules" CASCADE`);

        console.log('All course/batch related tables dropped. Sync should proceed cleanly.');
    } catch (err) {
        console.error('Error dropping tables:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

cleanup();
