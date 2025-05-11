const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: "Real Estate"
  },
  siteDescription: {
    type: String,
    default: "Real Estate Management System"
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Settings", settingsSchema);