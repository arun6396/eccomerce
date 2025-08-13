const express = require("express");
const replaceController = require("../Controller/replacementController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", verifyToken, replaceController.createReplacement);
router.get("/get", verifyToken, replaceController.getAllReplacement);
router.get("/get/:id", verifyToken, replaceController.getReplacementById);
router.put("/update/:id", verifyToken, replaceController.updateReplacementById);
router.delete(
  "/delete/:id",
  verifyToken,
  replaceController.deleteReplacementById
);

module.exports = router;
