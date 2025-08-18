const express = require("express");
const router = express.Router();
const returnOrder = require("../Controller/returnController");
const verifyToken = require("../middleware/authMiddleware");


router.post("/create", verifyToken, returnOrder.createReturnOrder);
router.get("/get",verifyToken,returnOrder.getAllReturnOrder);
router.get("/get/:id",verifyToken,returnOrder.getReturnOrderById);
router.put("/update/:id",verifyToken,returnOrder.updateReturnOrderById);
router.delete("/delete/:id",verifyToken,returnOrder.deleteReturnOrdereById)

module.exports = router;
