const mongoose = require('mongoose');
require('dotenv').config();
const order = require('../model/order');
const customer = require('../model/customer');
const product = require('../model/product');
const shipment = require('../model/shipment');
const faker = require('faker');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
  try {
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await order.deleteMany({});
    console.log('Cleared existing orders');

    // Get existing customers, products, and shipments
    const customers = await customer.find().limit(50);
    const products = await product.find().limit(100);
    const shipments = await shipment.find().limit(30);

    if (customers.length === 0 || products.length === 0 || shipments.length === 0) {
      console.error('Need at least 1 customer, 1 product, and 1 shipment record');
      process.exit(1);
    }

    const totalOrders = 5000;
    const orders = [];
    const statuses = [0, 1, 2, 3, 4]; // Valid statuses: Pending(0), Shipped(1), Delivery(2), Cancel(3), ReturnRequested(4)
    const paymentTypes = [0, 1, 2]; // All possible payment types

    console.log(`Generating ${totalOrders} test orders...`);

    for (let i = 0; i < totalOrders; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const shipment = shipments[Math.floor(Math.random() * shipments.length)];
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 products per order
      
      const orderProducts = [];
      let orderTotal = 0;
      
      // Select random products
      const selectedProducts = [];
      for (let j = 0; j < numProducts; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (selectedProducts.includes(product._id));
        
        selectedProducts.push(product._id);
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity per product
        orderProducts.push({
          productId: product._id,
          quantity: quantity,
          price: product.price
        });
        orderTotal += product.price * quantity;
      }

      const orderDate = faker.date.between('2023-01-01', '2025-12-31');
      
      orders.push({
        customerId: customer._id,
        products: orderProducts,
        totalAmount: orderTotal,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
        shipmentId: shipment._id,
        createdAt: orderDate,
        updatedAt: orderDate
      });

      // Insert in batches of 1000
      if (orders.length === 1000 || i === totalOrders - 1) {
        await order.insertMany(orders);
        console.log(`Inserted ${orders.length} orders (${i + 1}/${totalOrders})`);
        orders.length = 0; // Clear the array
      }
    }

    console.log('Test data generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating test data:');
    console.error(error.message);
    if (error.errors) {
      console.error('Validation errors:', Object.values(error.errors).map(e => e.message).join(', '));
    }
    process.exit(1);
  }
});
