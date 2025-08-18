const express = require('express');
const reviewController = require('../Controller/reviewController');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/create",verifyToken,reviewController.createReview);
router.get("/get",verifyToken,reviewController.getAllReview);
router.get("/get/:id",verifyToken,reviewController.getByReviewId);
router.put("/update/:id",verifyToken,reviewController.updateByReviewId);
router.delete("/delete/:id",verifyToken,reviewController.deleteReviewById);
router.get("/rating/:rating",verifyToken,reviewController.filterReview);
module.exports = router;