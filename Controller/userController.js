const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/users");
require("dotenv").config();
const { Role } = require("../model/users");
const responseFormatter = require("../Utils/responseFormatter");
exports.registerUser = async (req, res) => {
  try {
    const { username, mobileNumber, email, Dob, password, role } = req.body;

    const mobileRegex = /^[6-9]\d{9}$/;
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof role !== "number" || !Object.values(Role).includes(role)) {
      return res.status(400).json(responseFormatter({}, 400, "Invalid role"));
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{7,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json(
          responseFormatter(
            {},
            400,
            "Weak password: must include uppercase, lowercase, number, special character, and be at least 7 characters long."
          )
        );
    }

    if (!mobileRegex.test(mobileNumber)) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Invalid mobile number format"));
    }

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Invalid email format"));
    }

    if (await User.findOne({ username })) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Username already exists"));
    }

    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Email already registered"));
    }

    if (await User.findOne({ mobileNumber })) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Mobile number already registered"));
    }

    if (!password) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Password is required"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      mobileNumber,
      email,
      Dob,
      role,
    });
    await newUser.save();

    res
      .status(201)
      .json(
        responseFormatter({ newUser }, 201, "User registered successfully")
      );
  } catch (error) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", error.message));
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length)
      return res.status(404).json(responseFormatter({}, 404, "No users found"));
    res
      .status(200)
      .json(responseFormatter({ users }, 200, "Users retrieved successfully"));
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json(responseFormatter({}, 404, "User not found"));
    res.status(200).json(responseFormatter({ user }, 200, "User found"));
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!user)
      return res
        .status(404)
        .json(responseFormatter({}, 404, "User ID not found"));

    res
      .status(200)
      .json(responseFormatter({ user }, 200, "User updated successfully"));
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json(responseFormatter({}, 404, "User ID not found"));
    }
    res
      .status(200)
      .json(responseFormatter({}, 200, "User deleted successfully"));
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.loginUserByUsername = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json(responseFormatter({}, 401, "Invalid credentials"));
    }

    const now = Date.now();

    if (user.lockuntil && user.lockuntil > now) {
      const secondsLeft = Math.ceil((user.lockuntil - now) / 1000);
      return res
        .status(429)
        .json(
          responseFormatter(
            {},
            429,
            `Too many attempts. Try again after ${secondsLeft}s`
          )
        );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateFields = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        updateFields.lockuntil = now + 30 * 1000;
      }

      await user.updateOne({ $set: updateFields });

      const message =
        failedAttempts >= 5
          ? "Too many attempts. Account locked for 30 seconds"
          : `Invalid password. You have ${5 - failedAttempts} attempts left`;

      return res.status(401).json(responseFormatter({}, 401, message));
    }

    await user.updateOne({
      $set: { failedLoginAttempts: 0 },
      $unset: { lockuntil: "" },
    });

    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json(
        responseFormatter(
          { user: { _id: user._id, username: user.username, role: user.role } },
          200,
          "Login successful",
          token
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.loginUserByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // if (!emailRegex.test(email)) {
    //   return res
    //     .status(400)
    //     .json(responseFormatter({}, 400, "Invalid email format"));
    // }

    if (!user) {
      return res
        .status(401)
        .json(responseFormatter({}, 401, "Invalid credentials"));
    }

    const now = Date.now();

    if (user.lockuntil && user.lockuntil > now) {
      const secondsLeft = Math.ceil((user.lockuntil - now) / 1000);
      return res
        .status(429)
        .json(
          responseFormatter(
            {},
            429,
            `Too many attempts. Try again after ${secondsLeft}s`
          )
        );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateFields = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        updateFields.lockuntil = now + 30 * 1000;
      }

      await user.updateOne({ $set: updateFields });

      const message =
        failedAttempts >= 5
          ? "Too many attempts. Account locked for 30 seconds"
          : `Invalid password. You have ${5 - failedAttempts} attempts left`;

      return res.status(401).json(responseFormatter({}, 401, message));
    }

    await user.updateOne({
      $set: { failedLoginAttempts: 0 },
      $unset: { lockuntil: "" },
    });

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json(
      responseFormatter(
        {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
          },
        },
        200,
        "Login successful",
        token
      )
    );
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.loginUserByMobileNumber = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileRegex.test(mobileNumber)) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Invalid mobile number format"));
    }

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res
        .status(401)
        .json(responseFormatter({}, 401, "Invalid credentials"));
    }

    const now = Date.now();
    if (user.lockuntil && user.lockuntil > now) {
      const secondLeft = Math.ceil((user.lockuntil - now) / 1000);
      return res
        .status(429)
        .json(
          responseFormatter(
            {},
            429,
            `Too many attempts. Try again after ${secondLeft}s`
          )
        );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateFields = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        updateFields.lockuntil = now + 30 * 1000;
      }

      await user.updateOne({ $set: updateFields });

      const message =
        failedAttempts >= 5
          ? `Too many attempts. Your account is locked for 30 seconds`
          : `Invalid password. You have ${5 - failedAttempts} attempts left`;

      return res.status(401).json(responseFormatter({}, 401, message));
    }

    await user.updateOne({
      $set: { failedLoginAttempts: 0 },
      $unset: { lockuntil: "" },
    });
    const token = jwt.sign(
      { _id: user._id, mobileNumber: user.mobileNumber, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json(
      responseFormatter(
        {
          user: {
            _id: user._id,
            mobileNumber: user.mobileNumber,
            role: user.role,
          },
        },
        200,
        "Login successful",
        token
      )
    );
  } catch (err) {
    res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};
