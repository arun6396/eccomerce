const { model } = require("mongoose");
const review = require("../model/review");
const { populate } = require("../model/users");

exports.createReview = async (req, res) => {
  try {
    const reviews = await review.create(req.body);
    res.status(200).json({ message: "Review created Successfully", reviews });
  } catch (error) {
    res.status(500).json({ message: "Server ", error: error.message });
  }
};

exports.getAllReview = async (req, res) => {
  try {
    const reviews = await review
      .find()
      .populate("customerId")
      .populate({path:"productId",populate:[{path:'categoryById' ,model:'category'}],select: "categoryById brand descriptions" });
    if (!reviews.length) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getByReviewId = async (req, res) => {
  try {
    const reviews = await review
      .findById(req.params.id)
      .populate("customerId")
      .populate("productId");
    if (!reviews) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.updateByReviewId = async (req, res) => {
  try {
    const updatedReview = await review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.deleteReviewById = async (req, res) => {
  try {
    const reviews = await review.findByIdAndDelete(req.params.id);
    if (!reviews) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({message:"Review successfully deleted"});
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

