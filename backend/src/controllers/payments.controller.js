const paymentService = require('../services/payments.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
        return res.status(400).json({ error: { message: 'Idempotency-Key header is required' } });
    }
    const result = await paymentService.createPayment(req.body, idempotencyKey);
    return res.status(200).json(result)
})

const getAll = asyncHandler(async (req, res) => {
    const { status, from, to, page, limit } = req.query;
    const result = await paymentService.getAllPayments(status, from, to, page, limit);
    return res.status(200).json(result)
})
const getById = asyncHandler(async (req, res) => {

    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
        return res.status(404).json({ error: { message: 'Payment not found' } })
    }
    return res.status(200).json(payment)
})
const updateStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const result = await paymentService.updatePaymentStatus(req.params.id, status, 'API', note);
    return res.status(200).json(result)
})

module.exports = { create, getAll, getById, updateStatus }