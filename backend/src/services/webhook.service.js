const db = require('../config/db')
const { updatePaymentStatus } = require('./payments.service')

async function handleProviderWebhook(data) {
    const { transactionId, providerRef, status } = data;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. check payment webhooks if already exists return msg.
        const existing = await client.query(`
        SELECT * FROM payment_webhooks WHERE payment_id = $1 AND provider_ref = $2 AND status = $3
        `, [transactionId, providerRef, status]);

        if (existing.rows.length > 0) {
            await client.query('COMMIT');
            return {
                statusCode: 200, body: {
                    message: 'Webhook already processed',

                }
            };
        }
        // 2. update payment and history.
        const result = await updatePaymentStatus(
            transactionId,
            status,
            'WEBHOOK',
            null, client
        );
        // 3. create payment webhook
        await client.query(`
        INSERT INTO payment_webhooks(payment_id,provider_ref,status,payload) VALUES ($1, $2, $3, $4)
        `, [transactionId, providerRef, status, data]);
        // 4. commit and send response
        await client.query('COMMIT');
        return result;

    } catch (error) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}

module.exports = { handleProviderWebhook }