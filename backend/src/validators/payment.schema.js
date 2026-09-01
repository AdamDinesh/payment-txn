const { z } = require('zod');

const createPaymentSchema = z.object({
    merchantRef: z.string().min(1, 'merchantRef is required'),
    customerName: z.string().min(1, 'customerName is required'),
    customerEmail: z.string().email('customerEmail must be a valid email'),
    amount: z.number().positive('amount must be greater than 0'),
    currency: z.string().length(3).optional().default('INR'),
});

const updateStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'SUCCESS',
        'FAILED'
    ]),
    note: z.string().max(500).optional()
});

module.exports = { createPaymentSchema, updateStatusSchema };