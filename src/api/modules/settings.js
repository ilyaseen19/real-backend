const mongoose = require("mongoose");
const { defaultSettings } = require("../libs/siteSettings");

const settingsSchema = new mongoose.Schema({
  general: {
    type: mongoose.Schema.Types.Mixed,
    default: () => defaultSettings.general,
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: () => defaultSettings.location,
  },
  property: {
    type: mongoose.Schema.Types.Mixed,
    default: () => defaultSettings.property,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: () => defaultSettings.content,
  },
  developer: {
    type: mongoose.Schema.Types.Mixed,
    default: () => defaultSettings.developer,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Settings", settingsSchema);
