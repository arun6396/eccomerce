const express = require('express');
const gstController = require('../Controller/gstCategoryController');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/create",verifyToken,gstController.createGst);
router.get("/get",verifyToken,gstController.getAllGst);
router.get("/get/:id",verifyToken,gstController.getGStById);
router.put("/update/:id",verifyToken,gstController.updateGst);
router.delete("/delete/:id",verifyToken,gstController.deleteGst);

module.exports = router;