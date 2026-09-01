const express = require('express');
const router = express.Router();

const webhooksController = require('../controllers/webhooks.controller');
const validate = require('../middleware/validate');
const webhookSchema = require('../validators/webhook.schema');

router.post('/provider', validate(webhookSchema), webhooksController.providerWebhook);
router.post(
    '/generate-signature',
    webhooksController.generateWebhookSignature
);

module.exports = router;