const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: false,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
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
    agentId: {
      type: String,
      required: false,
      trim: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
      default: "Website visitor",
    },
    requesterEmail: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    requesterPhone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    clientInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "pending",
    },
    unreadCount: {
      type: Number,
      default: 1,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
