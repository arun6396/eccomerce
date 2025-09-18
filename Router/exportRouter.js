const express = require('express');
const router = express.Router();
const exportController = require('../Controller/exportController');

// Route for exporting orders to Excel
router.get('/orders/excel', exportController.exportToExcel);

module.exports = router;
