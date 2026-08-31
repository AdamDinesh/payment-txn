const express = require('express');
const router = express.Router();

const webhooksController = require('../controllers/webhooks.controller');


router.post('/provider', webhooksController.providerWebhook);
router.post(
    '/generate-signature',
    webhooksController.generateWebhookSignature
);

module.exports = router;