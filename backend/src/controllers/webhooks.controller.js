const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const webhookService = require('../services/webhook.service');

const providerWebhook = asyncHandler(async (req, res) => {

    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({
            error: {
                message: 'Missing webhook signature.'
            }
        })
    }
    const received = Buffer.from(signature, 'hex');

    const expected = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest();


    if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
    ) {
        return res.status(401).json({
            error: {
                message: 'Invalid webhook signature'
            }
        });
    }
    const result = await webhookService.handleProviderWebhook(req.body);
    return res.status(result.statusCode).json(result.body);
})


const generateWebhookSignature = asyncHandler(async (req, res) => {
    const signature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(req.rawBody.toString())
        .digest('hex');

    return res.status(200).json({
        signature
    });
});


module.exports = { providerWebhook, generateWebhookSignature }