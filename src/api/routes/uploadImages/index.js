const express = require("express");
const { upload } = require("../../middlewares/imageUpload");

const router = express.Router();

router.post("/user-image", upload.single("profileImg"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const profileImg = url + "/public/" + req.file.filename;
  res.status(200).json({
    success: 1,
    fileName: profileImg, // Fixed typo from 'fileNamee' to 'fileName'
  });
});

// Add a new route for handling multiple image uploads
router.post("/multiple-images", upload.array("images", 5), (req, res, next) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const imageUrls = req.files.map(file => url + "/public/" + file.filename);
    
    res.status(200).json({
      success: 1,
      fileNames: imageUrls
    });
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    res.status(500).json({
      success: 0,
      message: "Error uploading images"
    });
  }
});

module.exports = router;
