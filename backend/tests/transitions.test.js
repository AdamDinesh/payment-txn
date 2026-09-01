const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');


describe('POST /api/payments/:id/status', () => {
    test('should reject invalid status transition', async () => {

        const body = {
            merchantRef: 'MERCHANT-TEST-0003',
            customerName: 'Chozhan',
            customerEmail: 'chozhan@example.com',
            amount: 500,
            currency: 'INR'
        }
        const idempotencyKey = `test-${Date.now()}`

        const paymentRes = await request(app).post('/api/payments').set('Idempotency-Key', idempotencyKey).send(body);

        expect(paymentRes.statusCode).toBe(201);

        const transactionId = paymentRes.body.payment.id;
        // 2. update payment status INITIATED -> PENDING.

        const pendingResponse = await request(app).patch(`/api/payments/${transactionId}/status`)
            .send({
                status: 'PENDING'
            });
        expect(pendingResponse.statusCode).toBe(200);

        // 3. try invalid update payment status PENDING -> INITIATED.

        const invalidResponse = await request(app).patch(`/api/payments/${transactionId}/status`)
            .send({
                status: 'INITIATED'
            });

        expect(invalidResponse.statusCode).toBe(409);
        // 4. verify payment status is still PENDING.

        const result = await db.query(`
   SELECT * FROM payments WHERE id = $1 
    `, [transactionId]);

        expect(result.rows[0].status).toBe('PENDING');


    }, 15000)

})