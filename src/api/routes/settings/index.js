const express = require("express");
const Settings = require("../../modules/settings");

const router = express.Router();

router.get("/getSettings", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      return res.status(200).json({
        success: 1,
        data: settings,
      });
    }

    // If no settings exist, create default settings
    const defaultSettings = new Settings({
      siteName: "Real Estate",
      siteDescription: "Real Estate Management System",
      contactEmail: "contact@realestate.com",
      contactPhone: "+1234567890",
      address: "123 Real Estate Street",
      socialLinks: {
        facebook: "https://facebook.com/realestate",
        twitter: "https://twitter.com/realestate",
        instagram: "https://instagram.com/realestate",
        linkedin: "https://linkedin.com/company/realestate"
      }
    });

    const savedSettings = await defaultSettings.save();
    return res.status(200).json({
      success: 1,
      data: savedSettings,
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
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: 0,
        message: "Settings not found",
      });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { 
        $set: { 
          ...req.body,
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