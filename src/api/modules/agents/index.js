const mongoose = require("mongoose");

const agentProperties = new mongoose.Schema({
  propertyID: {
    type: String,
  },
});

const agentSchema = new mongoose.Schema(
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
    dob: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    ghanaCard: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gr1: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    gr1Contact: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    gr1Relation: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    gr2: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    gr2Contact: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    gr2Relation: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    fbAct: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    twAct: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    insAct: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    qr: {
      type: String,
      required: true,
      unique: false,
    },
    deals: {
      type: String,
      required: true,
      unique: false,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      unique: false,
    },
    properties: {
      type: [agentProperties],
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
