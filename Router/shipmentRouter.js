const express = require('express');
const shipmentController = require('../Controller/shipmentController');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/create",verifyToken,shipmentController.createShipment);
router.get("/get",verifyToken,shipmentController.getAllShipment);
router.get("/get/:id",verifyToken,shipmentController.getByShipmentId);
router.put("/update/:id",verifyToken,shipmentController.updateShipmentAddress);
router.delete("/delete/:id",verifyToken,shipmentController.deleteShipmentAddress);

module.exports = router;
