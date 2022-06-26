const express = require("express");
const { upload } = require("../../middlewares/imageUpload");

const router = express.Router();

router.post("/user-image", upload.single("profileImg"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const profileImg = url + "/public/" + req.file.filename;
  res.status(200).json({
    success: 1,
    fileNamee: profileImg,
  });
});

module.exports = router;
