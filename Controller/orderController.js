const order = require("../model/order");
const product = require("../model/product");
const { Status } = require("../model/order");
const { PaymentType } = require("../model/order");
const category = require("../model/category");
const { populate } = require("../model/users");


exports.createOrder = async (req, res) => {
  try {
    const { customerId, productId, quantity, status, paymentType, shipmentId } = req.body;

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
      return res.status(404).json({ message: `Product not found: ${productId}` });
    }

    if (productData.stock < quantity) {
      return res.status(400).json({ message: `Not enough stock for ${productData.ProductName}` });
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
      .populate("customerId").populate({path:"productId",
        populate:[
          { path: "categoryById", model: "category" },
          { path: "createdBy", model: "User" },
          { path: "gstCategoryId", model: "gstCategory" },
          { path: "discountId", model: "discount"}
        ]
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
      .populate("customerId")
      .populate({
        path: "productId",
        populate: [
          { path: "categoryById", model: "category" },
          { path: "createdBy", model: "User" },
          { path: "gstCategoryId", model: "gstCategory" },
          { path: "discountId", model: "discount" }
        ]
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
    const { status } = req.body;

    const validateStatus = [
      Status.Pending,
      Status.Shipped,
      Status.Delivery,
      Status.Cancel,
    ];
    if (!validateStatus.includes(status)) {
      return res.status(404).json({ messsage: "Incorrect status" });
    }

    const updateStatus = await order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updateStatus) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updateStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await order
      .find({ status: Status.Pending })
      .populate("customerId")
      .populate("productId")
      .populate("shipmentId");

    if (!pendingOrders.length) {
      return res.status(404).json({ mesasge: "Pending order not found" });
    }
    res.status(200).json({ pendingOrders });
  } catch (error) {
    res.status(500).json({ mesasge: "Server error ", error });
  }
};
exports.getDeliveredOrders = async (req, res) => {
  try {
    const DeliveredOrders = await order
      .find({ status: Status.Delivery })
      .populate("customerId")
      .populate("productId")
      .populate("shipmentId");

    if (!DeliveredOrders.length) {
      return res.status(404).json({ mesasge: "Delivered order not found" });
    }
    res.status(200).json({ DeliveredOrders });
  } catch (error) {
    res.status(500).json({ mesasge: "Server error ", error });
  }
};
exports.getShippedOrders = async (req, res) => {
  try {
    const shippedOrders = await order
      .find({ status: Status.Shipped })
      .populate("customerId")
      .populate("productId")
      .populate("shipmentId");

    if (!shippedOrders.length) {
      return res.status(404).json({ mesasge: "Shipped order not found" });
    }
    res.status(200).json({ shippedOrders });
  } catch (error) {
    res.status(500).json({ mesasge: "Server error ", error });
  }
};

exports.getCancelOrders = async (req, res) => {
  try {
    const cancelOrders = await order
      .find({ status: Status.Cancel })
      .populate("customerId")
      .populate("productId")
      .populate("shipmentId");

    if (!cancelOrders.length) {
      return res.status(404).json({ mesasge: "Cancel order not found" });
    }
    res.status(200).json({ cancelOrders });
  } catch (error) {
    res.status(500).json({ mesasge: "Server error ", error });
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
      .populate("customerId")
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
