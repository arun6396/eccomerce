const express = require("express");
const customerController = require("../Controller/customerController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", customerController.createCustomer);
router.get("/get", verifyToken, customerController.getAllCustomer);
router.get("/get/:id", verifyToken, customerController.customerById);
router.put("/update/:id", verifyToken, customerController.updateCustomer);
router.delete("/delete/:id", verifyToken, customerController.deleteCustomer);
router.post("/login",customerController.loginCustomerByemail);

module.exports = router;
