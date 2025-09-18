const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require('path');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/user", require("./Router/userRouter"));
app.use("/api/customer", require("./Router/customerRouter"));
app.use("/api/product", require("./Router/productRouter"));
app.use("/api/shipment", require("./Router/shipmentRouter"));
app.use("/api/gst", require("./Router/gstRouter"));
app.use("/api/discount", require("./Router/discountRouter"));
app.use("/api/order", require("./Router/orderRouter"));
app.use("/api/review", require("./Router/reviewRouting"));
app.use("/api/category", require("./Router/categoryRouter"));
app.use("/api/replace", require("./Router/replacementRouter"));
app.use("/api/return", require("./Router/returnOrderRouter"));
app.use("/api/email", require("./Router/emailRouter"));
app.use("/api/export", require("./Router/exportRouter"));

// Serve static files from the exports directory
app.use('/exports', express.static(path.join(__dirname, 'exports')));

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port: ${PORT}`);
});
