const express = require('express');
const router = express.Router();

const paymentsController = require('../controllers/payments.controller');

router.post('/', paymentsController.create);
router.get('/', paymentsController.getAll);
router.get('/:id', paymentsController.getById);
router.patch('/:id/status', paymentsController.updateStatus);


module.exports = router;