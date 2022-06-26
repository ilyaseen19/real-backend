const express = require("express");
const Requests = require("../../modules/intrested");

const router = express.Router();

router.get("/getRequests", async (req, res) => {
  try {
    const data = await Requests.find();
    if (data.length === 0)
      return res.status(404).json({
        success: 0,
        message: "No data found",
      });

    if (data.length !== 0)
      return res.status(200).json({
        success: 1,
        data: data,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.get("/getOne/:ID", async (req, res) => {
  try {
    const _id = req.params.ID;
    const data = await Requests.findOne({ _id });
    if (data)
      return res.status(200).json({
        success: 1,
        data: data,
      });

    if (!data)
      return res.status(404).json({
        success: 0,
        message: "No data found",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.delete("/remove/:ID", async (req, res) => {
  try {
    const deleted = await Requests.findByIdAndDelete({ _id: req.params.ID });
    if (deleted)
      return res.status(200).json({
        success: 1,
        message: "Data removed successfully",
      });

    if (!deleted)
      return res.status(400).json({
        success: 0,
        message: "Could not remove data",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 0,
      message: "Error code 500",
    });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userName, userContact, userID, agentID, property } = req.body;

    const request = new Requests({
      userName,
      userContact,
      userID,
      agentID,
      property,
    });

    const savedRequest = await request.save();
    if (savedRequest)
      return res.status(201).json({
        success: 1,
        message: "Request created successfully",
      });

    if (!savedRequest)
      return res.status(400).json({
        success: 0,
        message: "Could not save request",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 0,
      message: "Error code 500",
    });
  }
});

module.exports = router;
