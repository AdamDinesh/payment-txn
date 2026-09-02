const db = require('../src/config/db');
const { blockProduction } = require('./db-safety');

async function seedDatabase() {

    try {
        if (blockProduction('db:reset')) {
            return;
        }
        await db.query('BEGIN');

        // 1. create payments
        const payments = await db.query(`
            INSERT INTO payments (merchant_ref,idempotency_key,customer_name,customer_email,amount,currency,status,provider_ref)
            VALUES
                ('MERCHANT-1001', 'seed-key-1001', 'John Doe', 'john@example.com', 1500.00, 'INR', 'INITIATED', NULL),
                ('MERCHANT-1002', 'seed-key-1002', 'Jane Smith', 'jane@example.com', 2500.00, 'INR', 'PENDING', NULL),
                ('MERCHANT-1003', 'seed-key-1003', 'Rahul Kumar', 'rahul@example.com', 3500.00, 'INR', 'SUCCESS', 'PROV-1003'),
                ('MERCHANT-1004', 'seed-key-1004', 'Priya Sharma', 'priya@example.com', 4500.00, 'INR', 'FAILED', 'PROV-1004'),
                ('MERCHANT-1005', 'seed-key-1005', 'Amit Patel', 'amit@example.com', 5500.00, 'INR', 'SUCCESS', 'PROV-1005')
            RETURNING id, merchant_ref;
        `);

        console.log('Payments seeded:', payments.rows);

        const paymentIds = Object.fromEntries(
            payments.rows.map(row => [row.merchant_ref, row.id])
        );

        // 2. create payment history
        const history = [
            [paymentIds['MERCHANT-1001'], null, 'INITIATED', 'API', 'Payment created'],

            [paymentIds['MERCHANT-1002'], null, 'INITIATED', 'API', 'Payment created'],
            [paymentIds['MERCHANT-1002'], 'INITIATED', 'PENDING', 'API', 'Payment pending'],

            [paymentIds['MERCHANT-1003'], null, 'INITIATED', 'API', 'Payment created'],
            [paymentIds['MERCHANT-1003'], 'INITIATED', 'PENDING', 'API', 'Payment pending'],
            [paymentIds['MERCHANT-1003'], 'PENDING', 'SUCCESS', 'WEBHOOK', 'Payment succeeded'],

            [paymentIds['MERCHANT-1004'], null, 'INITIATED', 'API', 'Payment created'],
            [paymentIds['MERCHANT-1004'], 'INITIATED', 'PENDING', 'API', 'Payment pending'],
            [paymentIds['MERCHANT-1004'], 'PENDING', 'FAILED', 'WEBHOOK', 'Payment failed'],

            [paymentIds['MERCHANT-1005'], null, 'INITIATED', 'API', 'Payment created'],
            [paymentIds['MERCHANT-1005'], 'INITIATED', 'PENDING', 'API', 'Payment pending'],
            [paymentIds['MERCHANT-1005'], 'PENDING', 'SUCCESS', 'WEBHOOK', 'Payment succeeded']
        ];

        for (const [paymentId, oldStatus, newStatus, source, note] of history) {
            await db.query(`
                INSERT INTO payment_history (payment_id,old_status,new_status,source,note)
                VALUES ($1, $2, $3, $4, $5)`, [paymentId, oldStatus, newStatus, source, note]);
        }

        await db.query('COMMIT');

        console.log('Database seeded successfully.');
    } catch (error) {
        await db.query('ROLLBACK');

        console.error('Database seed failed:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

seedDatabase();