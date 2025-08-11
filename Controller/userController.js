const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/users");
require("dotenv").config();
const { Role } = require("../model/users");

exports.registerUser = async (req, res) => {
  try {
    const { username, mobileNumber, email, Dob, password, role } = req.body;

    const roleMap = {
      ADMIN: Role.ADMIN,
      MANAGER: Role.MANAGER,
      USER: Role.USER,
    };
    let roleValue;

    if (typeof role === "number" && Object.values(Role).includes(role)) {
      roleValue = role;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }
    if (await User.findOne({ mobileNumber })) {
      return res
        .status(400)
        .json({ message: "Mobile number already registered" });
    }

    if (!password || password.length < 7) {
      return res
        .status(400)
        .json({ message: "Password must be at least 7 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      mobileNumber,
      email,
      Dob,
      role: roleValue,
    });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) return res.status(404).json({ message: "User not found" });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error ", error: err.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const update = { ...req.body };
    update.password = await bcrypt.hash(update.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User id not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error ", error: err.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User id not found " });
    res.status(200).json({ message: "User delete successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error ", eror: err.message });
  }
};

exports.loginUserByUsername = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginUserByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error ", err });
  }
};

exports.loginUserByMobileNumber = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValidate = await bcrypt.compare(password, user.password);
    if (!isPasswordValidate) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { _id: user._id, mobileNumber: user.mobileNumber, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error ", err });
  }
};
