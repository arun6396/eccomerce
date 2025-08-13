const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;


connectDB();


app.use(cors());
app.use(express.json());


app.use('/api/user', require("./Router/userRouter"));
app.use('/api/customer',require("./Router/customerRouter"));
app.use('/api/product',require("./Router/productRouter"));
app.use('/api/shipment',require("./Router/shipmentRouter"));
app.use('/api/gst',require("./Router/gstRouter"));
app.use('/api/discount',require("./Router/discountRouter"));
app.use('/api/order',require('./Router/orderRoter'));
app.use('/api/review',require("./Router/reviewRouting"));
app.use('/api/category',require('./Router/categoryRouter'));
app.use('/api/replace',require('./Router/replacementRouter'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port: ${PORT}`);
});
