const { model } = require("mongoose");
const review = require("../model/review");
const { populate } = require("../model/users");
const Order = require("../model/order");
const { Status } = require("../model/order");
const order = require("../model/order");

exports.createReview = async (req, res) => {
  try {
    const { orderId, customerId, rating, comment } = req.body;

    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== Status.Delivery) {
      return res
        .status(400)
        .json({ message: "You can review only after Delivery " });
    }
    const existing = await review.findOne({ orderId, customerId });

    if (existing) {
      return res
        .status(400)
        .json({ message: "your already review this order" });
    }

    const newReview = await review.create({
      orderId,
      customerId,
      productId: order.productId,
      rating,
      comment,
    });

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
      .populate({
        path: "productId",
        populate: [{ path: "categoryById", model: "category" }],
        select: "categoryById brand descriptions",
      });
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
    res.status(200).json({ message: "Review successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};


