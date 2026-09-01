
const db = require('../src/config/db');

async function resetDatabase() {

    const confirmed = process.argv.includes('--confirm');

    if (!confirmed) {
        console.error(
            'Database reset cancelled. Use: npm run db:reset -- --confirm'
        );
        process.exitCode = 1;
        return;
    }

    try {
        await db.query(`
   DROP TABLE IF EXISTS payment_webhooks,payment_history,idempotency_keys,payments,pgmigrations CASCADE;
        `);

        console.log('Database reset successfully.');
    } catch (error) {
        console.error('Database reset failed:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

resetDatabase();