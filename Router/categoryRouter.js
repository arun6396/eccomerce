const express = require("express");
const categoryController = require("../Controller/categoryController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", verifyToken, categoryController.createCategory);
router.get("/get", verifyToken, categoryController.getAllCategory);
router.get("/get/:id", verifyToken, categoryController.getCategoryById);
router.put("/update/:id", verifyToken, categoryController.updateCategoryId);
router.delete(
  "/delete/:id",
  verifyToken,
  categoryController.deleteCategoryById
);

module.exports = router;
