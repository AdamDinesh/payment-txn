const crypto = require('crypto');
const db = require('../config/db');


async function createPayment(data, idempotencyKey) {
    const client = await db.connect();

    try {
        await client.query('BEGIN')
        // 1.check idempotency, if it already exists -> return it.
        const requestHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
        const existing = await client.query(`SELECT request_hash,response_body,status_code FROM idempotency_keys WHERE idempotency_key = $1 FOR UPDATE`, [idempotencyKey]);

        if (existing.rows.length > 0) {
            const record = existing.rows[0];
            await client.query('COMMIT');

            if (record.request_hash !== requestHash) {
                return {
                    statusCode: 409,
                    body: {
                        error: { message: 'Idempotency key already used with a different request' }
                    }
                }
            }
            return { statusCode: 200, body: record.response_body }

        }

        // 2.create payment

        const result = await client.query(`
           INSERT INTO payments(merchant_ref,idempotency_key,customer_name,customer_email,amount,currency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `, [data.merchantRef, idempotencyKey, data.customerName, data.customerEmail, data.amount, data.currency]);
        const payment = result.rows[0];

        // 3.create payment history

        await client.query(`INSERT INTO payment_history(payment_id,old_status,new_status,source,note)  VALUES ($1, $2, $3, $4, $5)`
            , [payment.id, null, payment.status, 'API', 'payment created']);

        // 4.create idempotency key.
        const responseBody = { payment };

        await client.query(`INSERT INTO idempotency_keys(idempotency_key,request_hash,response_body,status_code) VALUES  ($1, $2, $3, $4)`,
            [idempotencyKey, requestHash, responseBody, 201]
        )

        // 5. commit and send response
        await client.query('COMMIT');
        return {
            statusCode: 201,
            body: responseBody,
        };
    } catch (error) {
        await client.query('ROLLBACK')
        throw error;
    }
    finally {
        client.release()
    }
}

async function getPaymentById(id) {
    const paymentResult = await db.query(`
        SELECT * FROM payments WHERE id = $1
        `, [id])
    if (paymentResult.rows.length === 0) {
        return null;
    }

    const historyResult = await db.query(`
        SELECT * FROM payment_history WHERE payment_id = $1 ORDER BY created_at ASC
        `, [id])

    return {
        statusCode: 200,
        body: {
            payment: {
                ...paymentResult.rows[0],
                history: historyResult.rows
            }
        }
    }
}

async function getAllPayments(status, from, to, page = 1, limit = 10) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (status) {
        conditions.push(`status = $${index++}`);
        values.push(status)
    }
    if (from) {
        conditions.push(`created_at >= $${index++}`);
        values.push(from)
    }
    if (to) {
        conditions.push(`created_at <= $${index++}`);
        values.push(to)
    }

    const whereCondition = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const offset = (Number(page) - 1) * Number(limit);

    const dataValues = [...values, Number(limit), offset];

    const dataQuery = `SELECT * FROM payments ${whereCondition} ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
    const countQuery = `SELECT COUNT(*) FROM payments ${whereCondition}`;

    const [dataResult, countResult] = await Promise.all([db.query(dataQuery, dataValues), db.query(countQuery, values)]);

    return {
        statusCode: 200,
        body: {
            payments: dataResult.rows,
            total: Number(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit)
        }
    }

}

const ALLOWED_TRANSITIONS = {
    INITIATED: ['PENDING', 'FAILED'],
    PENDING: ['SUCCESS', 'FAILED'],
    SUCCESS: [],
    FAILED: []
}

async function updatePaymentStatus(id, newStatus, source, note = null, client = null) {
    const dbClient = client || await db.connect();
    try {
        if (!client) {
            await dbClient.query('BEGIN');
        }
        //1. check payments, if does not exist, rollback and return it.
        const result = await dbClient.query(`
        SELECT * FROM payments WHERE id = $1 FOR UPDATE
        `, [id])
        if (result.rows.length === 0) {
            if (!client) {
                await dbClient.query('ROLLBACK');
            }

            return {
                statusCode: 404,
                body: {
                    error: {
                        message: "Payment not found."
                    }
                }
            }
        }
        const payment = result.rows[0];
        //2. check allowed transistion status, if doesn not match, rollback and return it.

        const allowedStatus = ALLOWED_TRANSITIONS[payment.status] || [];
        if (!allowedStatus.includes(newStatus)) {
            if (!client) {
                await dbClient.query('ROLLBACK');
            }
            return {
                statusCode: 409,
                body: {
                    error: {
                        message: `Cannot move from ${payment.status} to ${newStatus}`,
                    }
                }
            }

        }

        //3. update payment status
        const updatedResult = await dbClient.query(
            ` UPDATE payments SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`, [newStatus, id]
        );

        //4. create payment history
        await dbClient.query(
            `INSERT INTO payment_history(payment_id,old_status,new_status,source,note) VALUES ($1, $2, $3, $4, $5)`,
            [id, payment.status, newStatus, source, note]
        )
        if (!client) {
            await dbClient.query('COMMIT');
        }
        //5. send response
        return {
            statusCode: 200,
            body: {
                payment: updatedResult.rows[0]
            }
        }
    }
    catch (error) {
        if (!client) {
            await dbClient.query('ROLLBACK');
        }
        throw error;
    }
    finally {
        if (!client) {
            dbClient.release();
        }
    }
}

module.exports = { createPayment, getAllPayments, getPaymentById, updatePaymentStatus }