const express = require("express");
const Settings = require("../../modules/settings");
const { defaultSettings, mergeLegacySettings, normalizeSettings } = require("../../libs/siteSettings");

const router = express.Router();

router.get("/getSettings", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await new Settings(defaultSettings).save();
    } else {
      const normalized = mergeLegacySettings(settings.toObject());
      settings = await Settings.findOneAndUpdate(
        { _id: settings._id },
        {
          $set: {
            ...normalized,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: 1,
      data: settings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.patch("/update", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await new Settings(defaultSettings).save();
    }

    const normalizedSettings = normalizeSettings(req.body || {});

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settings._id },
      { 
        $set: { 
          ...normalizedSettings,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    return res.status(200).json({
      success: 1,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

module.exports = router;
