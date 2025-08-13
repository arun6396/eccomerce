const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Role = {
  ADMIN: 0,
  MANAGER: 1,
  USER: 2,
};

const userSchema = new mongoose.Schema(
  {
    _id: { type: Number }, 
    username: { type: String, required: true, unique: true },
    mobileNumber: { type: Number, unique: true },
    email: { type: String },
    Dob: { type: String },
    password: { type: String, required: true },
    role: {
      type: Number,
      enum: [Role.ADMIN, Role.MANAGER, Role.USER],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
);

userSchema.plugin(AutoIncrement, { id: 'userId', inc_field: '_id' });

module.exports = mongoose.model("User", userSchema);
module.exports.Role = Role;
