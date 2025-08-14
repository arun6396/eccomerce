const express = require("express");
const router = express.Router();
const orderController = require("../Controller/orderController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/create", verifyToken, orderController.createOrder);

router.get("/get", verifyToken, orderController.getAllOrder);

router.get("/get/:id", verifyToken, orderController.getOrderById);

router.put("/update/:id", verifyToken, orderController.updateOderById);

router.delete("/delete/:id", verifyToken, orderController.deleteOrderById);

router.patch("/status/:id", verifyToken, orderController.statusUpdate);
router.get("/get/status/:status", verifyToken, orderController.getOrderStatus);

router.get(
  "/customer/:customerId",
  verifyToken,
  orderController.getOrderByCustomer
);

router.patch("/return/:id", verifyToken, orderController.returnOrderById);

module.exports = router;
