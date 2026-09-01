const db = require('../src/config/db');
afterAll(async () => {
    await db.end();
});