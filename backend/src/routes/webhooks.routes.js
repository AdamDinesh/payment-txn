const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const webhookSchema = require('../validators/webhook.schema');
const { verifyProviderWebhook } = require('../middleware/webhookSignature.middleware')
const { providerWebhook } = require('../controllers/webhooks.controller');
const { generateWebhookSignature } = require('../services/webhook.service');

router.post('/provider', validate(webhookSchema), verifyProviderWebhook, providerWebhook);
router.post('/generate-signature', generateWebhookSignature);

module.exports = router;