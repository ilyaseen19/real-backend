const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema({
  propID: {
    type: String,
    required: false,
    unique: false,
    trim: true,
  },
  propImage: {
    type: String,
    required: false,
    unique: false,
    trim: true,
  },
  propName: {
    type: String,
    required: false,
    unique: false,
    trim: true,
  },
});

const customerSchema = new mongoose.Schema(
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
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      required: true,
    },
    favorites: {
      type: [favoritesSchema],
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
