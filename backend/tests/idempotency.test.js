const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');


describe('POST /api/payments', () => {
    test('should not create dublicate payment with same idempotency key', async () => {

        const body = {
            merchantRef: 'MERCHANT-TEST-0001',
            customerName: 'Thamizh',
            customerEmail: 'thamizh@example.com',
            amount: 500,
            currency: 'INR'
        }
        const idempotencyKey = `test-${Date.now()}`
        // 1. first time -> create payment -> 201

        const firstResponse = await request(app).post('/api/payments').set('Idempotency-Key', idempotencyKey).send(body);
        expect(firstResponse.statusCode).toBe(201);

        // 2. second time -> same key + same body -> return existing payment -> 200
        const secondResponse = await request(app).post('/api/payments').set('Idempotency-Key', idempotencyKey).send(body);

        expect(secondResponse.statusCode).toBe(200);

        expect(secondResponse.body).toEqual(firstResponse.body);

        // 3. verify only one payment is created in the database 

        const result = await db.query(`
        SELECT COUNT(*) FROM payments WHERE idempotency_key = $1`, [idempotencyKey

        ]);
        expect(Number(result.rows[0].count)).toBe(1);
    }, 15000)


})