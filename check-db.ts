import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables in database:', res.rows.map(r => r.table_name));

        // Check batches columns for 'gst', 'price'
        const batches = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'batches'
    `);
        console.log('Columns in batches:', batches.rows.map(r => `${r.column_name} (${r.data_type})`));

        // Check for lessons_topics table (array)
        // Payload usually names arrays as parent_slug_field_slug
        const lessonsTopics = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'lessons_%'
    `);
        console.log('Lessons related tables:', lessonsTopics.rows.map(r => r.table_name));

        // Check courses columns
        const courses = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'courses'
        `);
        console.log('Columns in courses:', courses.rows.map(r => `${r.column_name} (${r.data_type})`));

        const coursesRels = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE 'courses_%'
        `);
        console.log('Courses related tables:', coursesRels.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();
