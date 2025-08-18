const { Status } = require("../model/order");
const returnOrder = require("../model/returnOrder");
const order = require("../model/order");
const { param } = require("../Router/returnOrderRouter");
const { updateOderById } = require("./orderController");

exports.createReturnOrder = async (req, res) => {
  try {
    const { orderId, customerId, status, processedBy, refundType } = req.body;

    const existingOrder = await order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(existingOrder.customerId) !== String(customerId)) {
      return res
        .status(404)
        .json({ message: "Customer not found for this order" });
    }

    if (existingOrder.status !== Status.ReturnRequested) {
      return res
        .status(400)
        .json({ message: "Only ReturnRequested status is valid" });
    }

    const newReturnOrder = new returnOrder({
      orderId,
      customerId,
      status,
      processedBy,
      refundType,
    });

    await newReturnOrder.save();

    res.status(201).json({
      message: "Return order created successfully",
      data: newReturnOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllReturnOrder = async (req, res) => {
  try {
    const AllreturnOrder = await returnOrder
      .find()
      .populate({ path: "customerId", select: "customerName" })
      .populate("orderId");
    if (!AllreturnOrder) {
      return res.status(404).json({ message: "Return order not found" });
    }
    res.status(200).json(AllreturnOrder);
  } catch (error) {
    res.status(500).res({ message: "Server error ", error: error.message });
  }
};

exports.getReturnOrderById = async (req, res) => {
  try {
    const ReturnOrderById = await returnOrder
      .findById(req.params.id)
      .populate({ path: "customerId", select: "customerName" })
      .populate("orderId");
    if (!ReturnOrderById) {
      return res.status(404).json({ message: "Return order not found" });
    }
    res.status(200).json(ReturnOrderById);
  } catch (error) {
    res.status.json({ message: "Server error ", error: error.message });
  }
};

exports.updateReturnOrderById = async (req, res) => {
  try {
    const updatedReturnOrder = await returnOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReturnOrder) {
      return res.status(404).json({ message: "Return order not found" });
    }

    res.status(200).json(updatedReturnOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.deleteReturnOrdereById = async (req, res) => {
  try {
    const deleteReturnOrder = await returnOrder.findByIdAndDelete(
      req.params.id
    );
    if (!deleteReturnOrder) {
      return res.status(404).json({ message: "Return order not found" });
    }

    res.status(200).json({ message: "Return order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};
