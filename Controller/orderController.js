const order = require("../model/order");
const product = require("../model/product");
const { Status } = require("../model/order");
const { PaymentType } = require("../model/order");
const category = require("../model/category");
const { populate } = require("../model/users");

exports.createOrder = async (req, res) => {
  try {
    const { customerId, productId, quantity, status, paymentType, shipmentId } =
      req.body;

    if (!customerId || !productId || !quantity || !paymentType || !shipmentId) {
      return res.status(400).json({ message: "Order fields missing" });
    }

    if (!Object.values(PaymentType).includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    if (!Object.values(Status).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const productData = await product.findById(productId);
    if (!productData) {
      return res
        .status(404)
        .json({ message: `Product not found: ${productId}` });
    }

    if (productData.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Not enough stock for ${productData.ProductName}` });
    }

    productData.stock -= quantity;
    await productData.save();

    const totalAmount = productData.price * quantity;

    const orders = await order.create({
      customerId,
      productId,
      quantity,
      totalAmount,
      status,
      paymentType,
      shipmentId,
    });

    res.status(201).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const orders = await order
      .find()
      .populate({ path: "customerId", select: "customerName" })
      .populate({
        path: "productId",
        populate: [
          { path: "categoryById" },
          { path: "createdBy" },
          { path: "gstCategoryId" },
          { path: "discountId" },
        ],
      })
      .populate("shipmentId");
    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orders = await order
      .findById(req.params.id)
      .populate({ path: "customerId", select: "customerName" })
      .populate({
        path: "productId",
        populate: [
          { path: "categoryById", model: "category" },
          { path: "createdBy", model: "users" },
          { path: "gstCategoryId", model: "gstCategory" },
          { path: "discountId", model: "discount" },
        ],
      })
      .populate("shipmentId");

    if (!orders) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateOderById = async (req, res) => {
  try {
    const updateOrder = await order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updateOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const orders = await order.findByIdAndDelete(req.params.id);
    if (!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.statusUpdate = async (req, res) => {
  try {
    const { status, validReason } = req.body;

    const validateStatus = [
      Status.Pending,
      Status.Shipped,
      Status.Delivery,
      Status.Cancel,
      Status.ReturnRequested,
    ];

    if (!validateStatus.includes(status)) {
      return res.status(400).json({ message: "Incorrect status" });
    }

    const currentOrder = await order.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (currentOrder.status === Status.Delivery) {
      return res.status(400).json({
        message: "Your order is already delivered, so it cannot be cancelled",
      });
    }

    const updatedData = { status };
    if (status === Status.Cancel) {
      if (!validReason || validReason.trim() === "") {
        return res.status(400).json({ message: "Cancel reason is required" });
      }
      updatedData.validReason = validReason;
    }
    if (status === Status.Cancel) {
      await product.findByIdAndUpdate(
        currentOrder.productId,
        { $inc: { stock: currentOrder.quantity } },
        { new: true }
      );
    }
    const updateStatus = await order.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updateStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const status = Number(req.params.status);
    if (!Object.values(Status).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const orderStatus = await order
      .find({ status })
      .populate({ path: "customerId", select: "customerName" })
      .populate({
        path: "productId",
        populate: [
          { path: "categoryById", model: "category" },
          { path: "createdBy", model: "users" },
          { path: "gstCategoryId", model: "gstCategory" },
          { path: "discountId", model: "discount" },
        ],
      })
      .populate("shipmentId");

    if (!orderStatus.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this status" });
    }

    res.status(200).json(orderStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: "CustomerId not found" });
    }

    const orders = await order
      .find({ customerId })
      .populate({ path: "customerId", select: "customerName" })
      .populate("productId")
      .populate("shipmentId");

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "Order not found of this customer id" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.returnOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { customerId, validReason } = req.body;

    const foundOrder = await order.findById(orderId);
    if (!foundOrder) {
      return res.status(400).json({ message: "Order not found" });
    }

    if (!validReason || validReason.trim() === "") {
      return res.status(400).json({ message: "Reason is required" });
    }

    if (foundOrder.customerId.toString() !== customerId) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (foundOrder.status !== Status.Delivery) {
      return res
        .status(400)
        .json({ message: "Order must be delivered before return" });
    }

    foundOrder.status = Status.ReturnRequested;
    foundOrder.validReason = validReason;
    await foundOrder.save();

    res.status(200).json({
      message: "Return request submitted successfully",
      order: foundOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
