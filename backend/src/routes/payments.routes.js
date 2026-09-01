const express = require('express');
const router = express.Router();

const paymentsController = require('../controllers/payments.controller');
const validate = require('../middleware/validate');
const { createPaymentSchema, updateStatusSchema } = require('../validators/payment.schema');

router.post('/', validate(createPaymentSchema), paymentsController.create);
router.get('/', validate(updateStatusSchema), paymentsController.getAll);
router.get('/:id', paymentsController.getById);
router.patch('/:id/status', paymentsController.updateStatus);


module.exports = router;