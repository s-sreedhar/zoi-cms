import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkUsersTable() {
    const client = await pool.connect();
    try {
        console.log('Checking users table schema...');
        const res = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY column_name;
        `);

        const columns = res.rows.map(r => r.column_name);
        console.log('Columns found:', columns);

        const expected = ['streak', 'points', 'last_quiz_date', 'active_session_id', 'last_ip', 'last_login'];
        const missing = expected.filter(c => !columns.includes(c));

        if (missing.length > 0) {
            console.error('❌ Missing columns:', missing);
            process.exit(1);
        } else {
            console.log('✅ All expected columns are present.');

            // Log details for streak specifically
            const streakCol = res.rows.find(r => r.column_name === 'streak');
            console.log('Streak column details:', streakCol);
        }

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkUsersTable();
