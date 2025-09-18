const order = require("../model/order");
const product = require("../model/product");
const { Status } = require("../model/order");
const { PaymentType } = require("../model/order");
const category = require("../model/category");
const { populate } = require("../model/users");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      products,
      status = Status.Pending,
      paymentType,
      shipmentId,
    } = req.body;

    // Validate required fields
    if (
      !customerId ||
      !products ||
      !Array.isArray(products) ||
      !products.length ||
      !paymentType ||
      !shipmentId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Required: customerId, products (array), paymentType, shipmentId",
      });
    }

    // Validate payment type
    if (!Object.values(PaymentType).includes(parseInt(paymentType))) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment type. Valid types are: ${Object.entries(
          PaymentType
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}`,
      });
    }

    // Validate status if provided
    if (
      status !== undefined &&
      !Object.values(Status).includes(parseInt(status))
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${Object.entries(Status)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}`,
      });
    }

    // Validate products and check stock
    let totalAmount = 0;
    const productUpdates = [];
    const orderProducts = [];

    for (const item of products) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Each product must have productId and quantity",
        });
      }

      const productData = await product.findById(item.productId);
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (productData.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${productData.ProductName}. Available: ${productData.stock}, Requested: ${item.quantity}`,
        });
      }

      // Calculate line total
      const lineTotal = productData.price * item.quantity;
      totalAmount += lineTotal;

      // Prepare product updates
      productUpdates.push({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        },
      });

      // Prepare order products
      orderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: productData.price,
        lineTotal,
      });
    }

    // Update all products' stock in a single operation
    if (productUpdates.length > 0) {
      await product.bulkWrite(productUpdates);
    }

    // Create the order
    const newOrder = await order.create({
      customerId,
      products: orderProducts.map((op) => ({
        productId: op.productId,
        quantity: op.quantity,
      })),
      totalAmount,
      status: parseInt(status) || Status.Pending,
      paymentType: parseInt(paymentType),
      shipmentId,
    });

    // Populate the response with product details
    const populatedOrder = await order
      .findById(newOrder._id)
      .populate({ path: "customerId", select: "customerName" })
      .populate({ path: "products.productId", select: "ProductName price" });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
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

// Generate PDF Invoice
exports.generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get order details with populated data
    const orderData = await order
      .findById(orderId)
      .populate({
        path: "customerId",
        select: "customerName email mobileNumber",
      })
      .populate({
        path: "products.productId",
        select: "ProductName price",
        model: "product", // Make sure this matches your product model name
      })
      .populate({
        path: "shipmentId",
        select: "address city state postalCode",
      });

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(__dirname, "..", "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set the filename and path for saving
    const filename = `invoice-${orderId}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    // Create a write stream to save the file
    const writeStream = fs.createWriteStream(filePath);

    // Format currency function with Indian numbering system
    const formatCurrency = (amount) => {
      const num = Number(amount);
      if (isNaN(num)) return "Rs. 0.00";

      // Convert to string with 2 decimal places
      let str = num.toFixed(2);

      // Split into integer and decimal parts
      const parts = str.split(".");
      let integerPart = parts[0];
      const decimalPart = parts[1] || "00";

      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherNumbers = integerPart.substring(0, integerPart.length - 3);
      const formatted =
        otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
        (otherNumbers ? "," : "") +
        lastThree;

      return "Rs. " + formatted + "." + decimalPart;
    };

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Pipe the PDF to both the response and the file
    doc.pipe(res);
    doc.pipe(writeStream);

    // Set document margins and initial position
    const leftMargin = 40;
    const rightMargin = 40;
    const pageWidth = 595.28; // A4 width in points
    const tableWidth = pageWidth - leftMargin - rightMargin;
    let currentY = 30; // Start a bit higher on the page

    // Company header
    doc
      .fillColor("#3498db")
      .fontSize(18)
      .text("INVOICE", leftMargin + 350, currentY + 15)
      .fillColor("#B22222")
      .fontSize(15)
      .text("ECCOMERCE SHOP", leftMargin + 180, currentY + 0)
      .fillColor("#000000")
      .fontSize(8)
      .text("123 Main St, Trichy", leftMargin, currentY + 36)
      .text("Tamilnadu - 620001", leftMargin, currentY + 46)
      .text("Phone: +91 6374625277", leftMargin, currentY + 56)
      .moveDown(1);
    currentY += 65;
    const invoiceDetailsY = currentY;

    doc
      .fontSize(9)
      .fillColor("#555555")
      .text("Invoice #:", leftMargin, invoiceDetailsY)
      .fillColor("#000000")
      .text(
        orderData._id.toString().substring(0, 8).toUpperCase(),
        leftMargin + 50,
        invoiceDetailsY
      )

      .fillColor("#555555")
      .text("Date:", leftMargin, invoiceDetailsY + 15)
      .fillColor("#000000")
      .text(
        new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        leftMargin + 50,
        invoiceDetailsY + 15
      );

    // Get status text and color based on order status
    const getStatusInfo = (status) => {
      switch (status) {
        case 0:
          return { text: "PENDING", color: "#f39c12" }; // Orange
        case 1:
          return { text: "CONFIRMED", color: "#3498db" }; // Blue
        case 2:
          return { text: "SHIPPED", color: "#9b59b6" }; // Purple
        case 3:
          return { text: "DELIVERED", color: "#27ae60" }; // Green
        case 4:
          return { text: "CANCELLED", color: "#e74c3c" }; // Red
        case 5:
          return { text: "RETURNED", color: "#7f8c8d" }; // Gray
        default:
          return { text: "PENDING", color: "#f39c12" };
      }
    };

    const statusInfo = getStatusInfo(orderData.status);

    // Display order status
    doc
      .fillColor("#555555")
      .text("Status:", 400, invoiceDetailsY)
      .fillColor(statusInfo.color)
      .text(statusInfo.text, 450, invoiceDetailsY)

      // Display payment status
      .fillColor("#555555")
      .text("Payment:", 400, invoiceDetailsY + 15)
      .fillColor(orderData.paymentStatus === 1 ? "#27ae60" : "#e67e22")
      .text(
        orderData.paymentType === 2
          ? orderData.paymentStatus === 1
            ? "PAID (COD)"
            : "PENDING (COD)"
          : orderData.paymentStatus === 1
          ? "PAID ONLINE"
          : "PENDING PAYMENT",
        450,
        invoiceDetailsY + 15
      )
      .moveDown(1.5);

    // Bill To section - moved down by increasing the space
    currentY += 30; // Increased from 20 to 30
    const billToY = currentY;

    // Bill To header
    doc
      .fillColor("#f5f5f5")
      .rect(leftMargin, billToY, tableWidth, 12)
      .fill()
      .fillColor("#333333")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("BILL TO", leftMargin + 5, billToY + 3);

    // Bill To content
    const billContentY = billToY + 15;
    doc
      .fillColor("#000000")
      .font("Helvetica")
      .fontSize(8)
      .text(
        (orderData.customerId?.customerName || "N/A").toUpperCase(),
        leftMargin,
        billContentY
      )
      .fontSize(7)
      .text(
        orderData.shipmentId?.address || "N/A",
        leftMargin,
        billContentY + 10,
        { width: 250 }
      )
      .text(
        `${orderData.shipmentId?.city || ""}${
          orderData.shipmentId?.state ? `, ${orderData.shipmentId.state}` : ""
        }${
          orderData.shipmentId?.postalCode
            ? ` - ${orderData.shipmentId.postalCode}`
            : ""
        }`,
        leftMargin,
        billContentY + 18,
        { width: 250 }
      )
      .text(
        `Phone: ${orderData.customerId?.mobileNumber || "N/A"}`,
        leftMargin,
        billContentY + 28,
        { width: 250 }
      )
      .moveDown(1);

    // Order items table header
    currentY += 40;
    const tableTop = currentY;
    doc
      .fillColor("#ffffff")
      .rect(leftMargin, tableTop, tableWidth, 20)
      .fillAndStroke("#3498db", "#3498db")
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#ffffff")
      .text("Description", leftMargin + 10, tableTop + 6)
      .text("Qty", leftMargin + 350, tableTop + 6)
      .text("Unit Price", leftMargin + 400, tableTop + 6)
      .text("Total", leftMargin + 480, tableTop + 6)
      .moveDown(1);

    // Order items rows
    let itemTop = tableTop + 20;

    // Loop through each product in the order
    orderData.products.forEach((item, index) => {
      const product = item.productId;
      doc
        .fillColor("#000000")
        .font("Helvetica")
        .fontSize(8)
        .text(product?.ProductName || "N/A", leftMargin + 10, itemTop + 8, {
          width: 300,
          lineGap: 4,
        })
        .text((item.quantity || 0).toString(), leftMargin + 380, itemTop + 8)
        .text(
          formatCurrency(product?.price || 0),
          leftMargin + 400,
          itemTop + 8
        )
        .text(
          formatCurrency((product?.price || 0) * (item.quantity || 0)),
          leftMargin + 460,
          itemTop + 8
        );

      // Move down for next item
      itemTop += 20;
    });

    // Add a line after all items
    doc
      .moveTo(leftMargin, itemTop + 8)
      .lineTo(leftMargin + tableWidth, itemTop + 8)
      .stroke("#e0e0e0");

    // Add total amount
    doc
      .font("Helvetica-Bold")
      .text("Total Amount:", leftMargin + 400, itemTop + 20)
      .text(
        formatCurrency(orderData.totalAmount || 0),
        leftMargin + 450,
        itemTop + 20,
        { width: 90, align: "right" }
      );

    // Add a line after the item
    doc
      .moveTo(leftMargin, itemTop + 28)
      .lineTo(leftMargin + tableWidth, itemTop + 28)
      .stroke("#e0e0e0");

    // Total section
    const totalY = itemTop + 40; // Space before total section

    // Calculate subtotal from all products
    const subtotal = orderData.products.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * (item.quantity || 0);
    }, 0);

    // Calculate tax (18% of subtotal)
    const taxRate = 18; // 18% tax
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;

    // Draw the total section box
    doc.rect(leftMargin + 350, totalY - 10, 200, 90).stroke("#e0e0e0");

    // Add total section header
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#333333")
      .text("BILLING SUMMARY", leftMargin + 360, totalY + 5, {
        width: 180,
        align: "left",
      });

    // Add horizontal line under header
    doc
      .moveTo(leftMargin + 360, totalY + 20)
      .lineTo(leftMargin + 530, totalY + 20)
      .stroke("#e0e0e0");

    // Add subtotal, tax, and total
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text("Subtotal:", leftMargin + 360, totalY + 30)
      .text(formatCurrency(subtotal), leftMargin + 460, totalY + 30, {
        width: 70,
        align: "right",
      })
      .text(`Tax (${taxRate}%):`, leftMargin + 360, totalY + 45)
      .text(formatCurrency(tax), leftMargin + 460, totalY + 45, {
        width: 70,
        align: "right",
      })
      .moveTo(leftMargin + 360, totalY + 60)
      .lineTo(leftMargin + 530, totalY + 60)
      .stroke("#e0e0e0")
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#000000")
      .text("Total Amount:", leftMargin + 360, totalY + 70)
      .text(formatCurrency(total), leftMargin + 450, totalY + 70, {
        width: 90,
        align: "right",
      });

    // Payment status
    const paymentStatusY = totalY + 25;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text("Payment Status:", leftMargin, paymentStatusY)
      .fillColor(orderData.paymentType === 2 ? "#e67e22" : "#27ae60")
      .text(
        orderData.paymentType === 2 ? "PENDING (CASH ON DELIVERY)" : "PAID",
        leftMargin + 80,
        paymentStatusY
      );

    // Footer
    const footerY = paymentStatusY + 90;
    doc
      .fillColor("#555555")
      .fontSize(8)
      .text("Thank you for your business!", leftMargin, footerY, {
        align: "center",
        width: tableWidth,
      })
      .fontSize(7)
      .text(
        "This is a computer-generated invoice.",
        leftMargin,
        footerY + 10,
        {
          align: "center",
          width: tableWidth,
        }
      );
    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res
      .status(500)
      .json({ message: "Error generating invoice", error: error.message });
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
