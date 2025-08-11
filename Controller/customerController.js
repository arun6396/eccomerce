const express = require("express");
const Customers = require("../model/customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const customer = require("../model/customer");

exports.createCustomer = async (req, res) => {
  try {
    const { customerName, mobileNumber, email, password, DOB, createdBy } =
      req.body;
    if (await Customers.findOne({ mobileNumber })) {
      return res.status(400).json({ message: "MobileNumber already exists" });
    }
    if (await Customers.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (!password || password.length < 7) {
      return res
        .status(400)
        .json({ message: "Password must be at least 7 characters long" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customers({
      customerName,
      mobileNumber,
      email,
      password: hashPassword,
      DOB,
      createdBy,
    });
    await newCustomer.save();
    res
      .status(200)
      .json({ message: "Customer registered successfully", newCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllCustomer = async (req, res) => {
  try {
    const customer = await Customers.find();
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: " Error  : " + err.message });
  }
};

exports.customerById = async (req, res) => {
  try {
    const customer = await Customers.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: " Error " + err.message });
  }
};
exports.updateCustomer = async (req, res) => {
  try {
    const updated = { ...req.body };
    updated.password = await bcrypt.hash(updated.password, 10);
    const customer = await Customers.findByIdAndUpdate(req.params.id, updated, {
      new: true,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Customer update Error " + err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customers.findByIdAndDelete(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted sucessfully " });
  } catch (err) {
    res.status(500).json({ message: "Delete customer error " + err.message });
  }
};

exports.loginCustomerByemail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customers.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const isPasswordValidate = await bcrypt.compare(
      password,
      customer.password
    );
    if (!isPasswordValidate) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginCustomerByMobileNumber = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    const customer = await Customers.findOne({ mobileNumber });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const isPasswordValidate = await bcrypt.compare(
      password,
      customer.password
    );
    if (!isPasswordValidate) {
      return res.status(404).json({ message: "Invalid credential" });
    }
    const token = jwt.sign(
      { mobileNumber: customer.mobileNumber },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginCustomerByUsername = async (req, res) => {
  try {
    const { customerName, password } = req.body;
    const customer = await Customers.findOne({ customerName });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const isPasswordValidate = await bcrypt.compare(
      password,
      customer.password
    );
    if (!isPasswordValidate) {
      return res.status(404).json({ message: "Invalid credential" });
    }
    const token = jwt.sign(
      { customerName: customer.customerName },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};


