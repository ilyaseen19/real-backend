const mongoose = require("mongoose");

const requestsSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    userContact: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    userID: {
      type: String,
      required: true,
      trim: true,
    },
    agentID: {
      type: String,
      required: true,
      trim: true,
    },
    property: {
      propName: {
        type: String,
        required: true,
      },
      propLocation: {
        type: String,
        required: true,
      },
      propID: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requests", requestsSchema);
