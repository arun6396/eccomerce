const express = require('express');
const router = express.Router();
const discountController = require('../Controller/discountController');
const verifyToken = require('../middleware/authMiddleware');

router.post("/create",verifyToken,discountController.createDiscount);
router.get("/get",verifyToken,discountController.getAllDiscounts);
router.get("/get/:id",verifyToken,discountController.getDiscountById);
router.put("/update/:id",verifyToken,discountController.updateDiscount);
router.delete("/delete/:id",verifyToken,discountController.deleteDiscount);


module.exports=router;
