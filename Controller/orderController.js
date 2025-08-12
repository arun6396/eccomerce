const order = require("../model/order");
const product = require("../model/product");
const { Status } = require("../model/order");
const { PaymentType } = require("../model/order");
exports.createOrder = async (req, res) => {
  try {
    const { customerId, productDetails, status, paymentType, shipmentId } =
      req.body;

    let paymentValue;

    if (
      typeof paymentType === "number" &&
      Object.values(PaymentType).includes(paymentType)
    ) {
      paymentValue = paymentType;
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }
    let statusValue;
    if (typeof status === "number" && Object.values(Status).includes(status)) {
      statusValue = status;
    } else {
      return res.status(400).json({ message: "Invalid Status" });
    }
    if (!customerId || !productDetails || !paymentType || !shipmentId) {
      return res.status(404).json({ message: "Order fields missing" });
    }

    let total = 0;

    const updatedProductDetails = await Promise.all(
      productDetails.map(async (item) => {
        const productData = await product.findById(item.productId);

        if (!productData) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (productData.stock < item.quantity) {
          return res.status(404).json({
            message: `Not enough stock for ${productData.ProductName}`,
          });
        }
        total += productData.price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: productData.price,
        };
      })
    );

    const orders = await order.create({
      customerId,
      productDetails: updatedProductDetails,
      totalAmount: total,
      status: statusValue,
      paymentType: paymentValue,
      shipmentId,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const orders = await order
      .find()
      .populate("customerId")
      .populate("productDetails.productId")
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
      .populate("productDetails.productId")
      .populate("shipmentId");
    if (!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
      .populate("productDetails.productId")
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
      .populate("productDetails.productId")
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
      .populate("productDetails.productId")
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
      .populate("productDetails.productId")
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
      .populate("productDetails.productId")
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
