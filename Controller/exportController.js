const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const order = require("../model/order");

// Ensure exports directory exists
const exportsDir = path.join(__dirname, "..", "exports");
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Export orders to Excel
exports.exportToExcel = async (req, res) => {
  try {
    // 1. Get orders from DB with populated data
    const orders = await order
      .find()
      .populate("customerId", "customerName email")
      .populate("products.productId", "ProductName price")
      .populate("shipmentId", "state");

    // 2. Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 10 },
      { header: "Customer Name", key: "customerName", width: 20 },
      { header: "Product", key: "productName", width: 25 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit Price", key: "unitPrice", width: 15 },
      { header: "Total", key: "total", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Payment Type", key: "paymentType", width: 15 },
      { header: "State", key: "state", width: 20 },
      { header: "Order Date", key: "orderDate", width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    orders.forEach((order) => {
      const statusMap = {
        0: "Pending",
        1: "Processing",
        2: "Shipped",
        3: "Delivered",
        4: "Cancelled",
        5: "Returned",
        6: "Refunded",
      };

      const paymentTypeMap = {
        0: "Card",
        1: "UPI",
        2: "Cash on Delivery",
      };

      if (order.products && order.products.length > 0) {
        order.products.forEach((item) => {
          const product = item.productId;
          const row = worksheet.addRow({
            orderId: order._id,
            customerName: order.customerId?.customerName || "N/A",
            productName: product?.ProductName || "N/A",
            quantity: item.quantity,
            unitPrice: product?.price || 0,
            total: (product?.price || 0) * item.quantity,
            status: statusMap[order.status] || "Pending",
            paymentType: paymentTypeMap[order.paymentType] || "Unknown",
            state: order.shipmentId?.state || "N/A",
            orderDate: order.createdAt.toLocaleDateString(),
          });

          if (row.number % 2 === 0) {
            row.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F2F2F2" },
            };
          }
        });
      } else {
        const row = worksheet.addRow({
          orderId: order._id,
          customerName: order.customerId?.customerName || "N/A",
          productName: "No products",
          quantity: 0,
          unitPrice: 0,
          total: 0,
          status: statusMap[order.status] || "Pending",
          paymentType: paymentTypeMap[order.paymentType] || "Unknown",
          state: order.shipmentId?.state || "N/A",
          orderDate: order.createdAt.toLocaleDateString(),
        });

        if (row.number % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F2F2F2" },
          };
        }
      }
    });

    ////////    Auto fit   //////////
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    const footerRow = worksheet.addRow([
      `Generated on: ${new Date().toLocaleString()}`,
    ]);
    footerRow.font = { italic: true };
    footerRow.getCell(1).alignment = { horizontal: "right" };
    worksheet.mergeCells(`A${footerRow.number}:J${footerRow.number}`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `orders_export_${timestamp}.xlsx`;
    const filePath = path.join(exportsDir, filename);

    // Ensure the exports directory exists
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write the file
    await workbook.xlsx.writeFile(filePath);
    
    // Construct the public URL (adjust the base URL as needed)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/exports/${filename}`;
    
    // Return the file URL in the response
    res.json({
      success: true,
      message: 'Export completed successfully',
      fileUrl: fileUrl,
      fileName: filename
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    res
      .status(500)
      .json({ message: "Error generating Excel export", error: error.message });
  }
};
