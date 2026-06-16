const express = require("express");
const Chat = require("../../modules/chats");
const Property = require("../../modules/properties");

const router = express.Router();

const formatMessageTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const mapChatSummary = (chat) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

  return {
    id: String(chat._id),
    user: {
      name: chat.requesterName || "Website visitor",
      avatar: "",
      status: chat.status === "closed" ? "offline" : "online",
      email: chat.requesterEmail || "Guest visitor",
      isOnline: chat.status !== "closed",
    },
    property: {
      id: chat.propertyId,
      name: chat.propertyName,
    },
    lastMessage: {
      text: lastMessage?.text || "Live chat requested",
      time: formatMessageTime(lastMessage?.timestamp || chat.updatedAt),
      isRead: !!lastMessage?.isRead,
    },
    lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
    unreadCount: chat.unreadCount || 0,
  };
};

const mapChatMessage = (message) => ({
  id: String(message._id),
  sender: message.senderRole,
  senderId: message.senderId || "",
  text: message.text,
  time: formatMessageTime(message.timestamp),
  timestamp: message.timestamp,
  isRead: !!message.isRead,
});

router.post("/request", async (req, res) => {
  try {
    const { propertyId, clientInfo = {} } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: 0,
        message: "Property is required",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: 0,
        message: "Property not found",
      });
    }

    const requesterName =
      clientInfo.name ||
      clientInfo.userName ||
      clientInfo.email ||
      clientInfo.phone ||
      "Website visitor";

    const chat = await Chat.create({
      propertyId: String(property._id),
      propertyName: property.name,
      agentId: property.agentID || "",
      requesterName,
      requesterEmail: clientInfo.email || "",
      requesterPhone: clientInfo.phone || "",
      clientInfo,
      status: "pending",
      unreadCount: 1,
      messages: [
        {
          senderRole: "client",
          senderId: "",
          text: `Live chat requested for ${property.name}.`,
          isRead: false,
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: 1,
      message: "Live chat request created successfully",
      data: {
        requestId: String(chat._id),
        chatId: String(chat._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { viewerId = "", viewerRole = "Admin" } = req.query;
    const query =
      String(viewerRole).toLowerCase() === "agent" && viewerId
        ? { agentId: String(viewerId) }
        : {};

    const chats = await Chat.find(query).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: 1,
      data: chats.map(mapChatSummary),
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.get("/:chatId/messages", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: 1,
      data: chat.messages.map(mapChatMessage),
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.post("/:chatId/messages", async (req, res) => {
  try {
    const { text, senderId = "", senderRole = "admin" } = req.body;

    if (!text) {
      return res.status(400).json({
        success: 0,
        message: "Message text is required",
      });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
      });
    }

    const message = {
      senderRole,
      senderId,
      text,
      isRead: senderRole === "client",
      timestamp: new Date(),
    };

    chat.messages.push(message);
    chat.status = "open";
    if (senderRole === "client") {
      chat.unreadCount += 1;
    }

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    return res.status(201).json({
      success: 1,
      data: mapChatMessage(savedMessage),
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.put("/:chatId/read", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
      });
    }

    chat.unreadCount = 0;
    chat.messages = chat.messages.map((message) => ({
      ...message.toObject(),
      isRead: true,
    }));

    await chat.save();

    return res.status(200).json({
      success: 1,
      message: "Chat marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

module.exports = router;
