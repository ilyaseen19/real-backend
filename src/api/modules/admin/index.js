const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
