const db = require('../src/config/db');

async function clearDatabase() {
    try {
        await db.query(`
TRUNCATE TABLE payment_webhooks, payment_history, idempotency_keys, payments RESTART IDENTITY CASCADE
        `);

        console.log('Database tables cleared successfully.');
    } catch (error) {
        console.error('Database clear failed:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

clearDatabase();