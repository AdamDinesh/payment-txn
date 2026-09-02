const asyncHandler = require('../utils/asyncHandler');
const webhookService = require('../services/webhook.service');

const providerWebhook = asyncHandler(async (req, res) => {
    const result = await webhookService.handleProviderWebhook(req.body);
    return res.status(result.statusCode).json(result.body);
})

module.exports = { providerWebhook }