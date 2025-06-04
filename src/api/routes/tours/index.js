const express = require("express");
const Tour = require("../../modules/tours");
const Property = require("../../modules/properties");
const Agent = require("../../modules/agents");

const router = express.Router();

// Book a new tour
router.post("/book", async (req, res) => {
  try {
    const { userName, email, phone, tourDate, tourTime, note, propertyId, agentid } = req.body;

    // Validate required fields
    if (!userName || !email || !phone || !tourDate || !tourTime || !note || !propertyId || !agentid) {
      return res.status(400).json({
        success: 0,
        message: "All fields are required",
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: 0,
        message: "Property not found",
      });
    }

    // Check if agent exists
    const agent = await Agent.findById(agentid);
    if (!agent) {
      return res.status(404).json({
        success: 0,
        message: "Agent not found",
      });
    }

    const newTour = new Tour({
      userName,
      email,
      phone,
      tourDate,
      tourTime,
      note,
      propertyId,
      agentid,
    });

    const savedTour = await newTour.save();

    return res.status(201).json({
      success: 1,
      message: "Tour booked successfully",
      data: savedTour,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

// Get all tours
router.get("/getAll", async (req, res) => {
  try {
    const tours = await Tour.find();
    
    if (tours.length === 0) {
      return res.status(404).json({
        success: 0,
        message: "No tours found",
      });
    }

    return res.status(200).json({
      success: 1,
      data: tours,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

// Get single tour with populated propertyId and agentid
router.get("/getOne/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id)
      .populate("propertyId")
      .populate("agentid");

    if (!tour) {
      return res.status(404).json({
        success: 0,
        message: "Tour not found",
      });
    }

    return res.status(200).json({
      success: 1,
      data: tour,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

// Update tour
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, phone, note, propertyId, agentid } = req.body;

    // Check if tour exists
    const existingTour = await Tour.findById(id);
    if (!existingTour) {
      return res.status(404).json({
        success: 0,
        message: "Tour not found",
      });
    }

    // If propertyId is being updated, validate it exists
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: 0,
          message: "Property not found",
        });
      }
    }

    // If agentid is being updated, validate it exists
    if (agentid) {
      const agent = await Agent.findById(agentid);
      if (!agent) {
        return res.status(404).json({
          success: 0,
          message: "Agent not found",
        });
      }
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      {
        ...(userName && { userName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(note && { note }),
        ...(propertyId && { propertyId }),
        ...(agentid && { agentid }),
      },
      { new: true }
    );

    return res.status(200).json({
      success: 1,
      message: "Tour updated successfully",
      data: updatedTour,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

// Delete tour
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) {
      return res.status(404).json({
        success: 0,
        message: "Tour not found",
      });
    }

    return res.status(200).json({
      success: 1,
      message: "Tour deleted successfully",
      data: deletedTour,
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