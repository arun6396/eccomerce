const express = require('express');
const router = express.Router();
const orderController = require('../Controller/orderController');

// Existing routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOderById);
router.delete('/:id', orderController.deleteOrderById);
router.put('/status/:id', orderController.statusUpdate);
router.get('/status/:id', orderController.getOrderStatus);
router.get('/customer/:customerId', orderController.getOrderByCustomer);
router.put('/return/:id', orderController.returnOrderById);

// New route for generating PDF invoice
router.get('/:id/invoice', orderController.generateInvoice);

module.exports = router;
