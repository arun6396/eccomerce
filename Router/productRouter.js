const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const productController = require("../Controller/productController");
router.post("/create", verifyToken, productController.createProduct);
router.get("/get", verifyToken, productController.getAllProductId);
router.get("/get/:id", verifyToken, productController.getProductById);
router.put("/update/:id", verifyToken, productController.updateProductById);
router.delete("/delete/:id", verifyToken, productController.deleteProductById);
router.get(
  "/get/category/:id",
  verifyToken,
  productController.findProductByCategoryId
);
router.get("/search", verifyToken, productController.productSearch);
router.get("/brand", verifyToken, productController.findByProductBrand);
router.get("/name", verifyToken, productController.findByProductName);
router.get("/byname", verifyToken, productController.findProductByCategoryName);
router.patch(
  "/update/quantity/:id",
  verifyToken,
  productController.updateQuantityById
);

module.exports = router;
