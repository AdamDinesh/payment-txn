const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');


describe('POST /api/webhooks/provider', () => {
    test('should reject webhook with invalid signature', async () => {
        // 1. create payment
        const body = {
            merchantRef: 'MERCHANT-TEST-0001',
            customerName: 'Arasan',
            customerEmail: 'arasan@example.com',
            amount: 700,
            currency: 'INR'
        }
        const idempotencyKey = `test-${Date.now()}`

        const paymentRes = await request(app).post('/api/payments').set('Idempotency-Key', idempotencyKey).send(body);

        expect(paymentRes.statusCode).toBe(201);

        const transactionId = paymentRes.body.payment.id;
        // 2. update payment status INITIATED -> PENDING.

        const statusResponse = await request(app).patch(`/api/payments/${transactionId}/status`)
            .send({
                status: 'PENDING'
            });


        expect(statusResponse.statusCode).toBe(200);
        // 3. send webhook with invalid signature.
        const webhookResponse = await request(app)
            .post('/api/webhooks/provider')
            .set('X-Webhook-Signature', 'invalid-signature')
            .send({
                transactionId,
                providerReference: 'PROV-TEST-001',
                status: 'SUCCESS',
                timestamp: new Date().toISOString()
            });

        expect(webhookResponse.statusCode).toBe(401);
        // 4. verify payment status is still PENDING.

        const result = await db.query(`
   SELECT * FROM payments WHERE id = $1 
    `, [transactionId]);

        expect(result.rows[0].status).toBe('PENDING');

        // 5. verify webhooks was not created.

        const webhookResult = await db.query(`
    SELECT * FROM payment_webhooks WHERE payment_id = $1 AND provider_ref = $2`, [transactionId, 'PROV-TEST-001'])

        expect(webhookResult.rows.length).toBe(0);
    }, 15000);

})