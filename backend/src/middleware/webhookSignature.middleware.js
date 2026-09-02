const crypto = require('crypto');

const verifyProviderWebhook = (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];

    if (!signature) {
        return res.status(401).json({
            error: {
                message: 'Missing webhook signature.'
            }
        });
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

    next();
};

module.exports = { verifyProviderWebhook };