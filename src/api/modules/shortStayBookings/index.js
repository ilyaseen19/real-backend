const mongoose = require("mongoose");

const shortStayBookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      trim: true,
    },
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },
    agentID: {
      type: String,
      required: true,
      trim: true,
    },
    userID: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    checkInDate: {
      type: String,
      required: true,
      trim: true,
    },
    checkOutDate: {
      type: String,
      required: true,
      trim: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    nightlyRate: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: false,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    guests: {
      type: Number,
      required: false,
      default: 1,
    },
    message: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    bookedDates: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "Booked",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShortStayBooking", shortStayBookingSchema);
