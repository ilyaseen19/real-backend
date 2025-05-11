const express = require("express");
const Property = require("../../modules/properties");
const Agent = require("../../modules/agents");
const { upload } = require("../../middlewares/imageUpload");

const router = express.Router();

router.get("/getProperties", async (req, res) => {
  try {
    const data = await Property.find();
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
    const data = await Property.findOne({ _id });
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

router.get("/findMany/", async (req, res) => {
  try {
    const IDs = req.body.IDs;
    const data = await Property.find();

    const properties = data.filter((el) => {
      return IDs.some((id) => {
        return el.agentID === id.propertyID;
      });
    });

    if (properties.length > 0)
      return res.status(200).json({
        success: 1,
        data: properties,
      });

    if (properties.length === 0)
      return res.status(200).json({
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

router.patch("/update/:ID", async (req, res) => {
  try {
    const _id = req.params.ID;
    const { isApproved } = req.body;
    const updated = await Property.updateOne(
      {
        _id,
      },
      {
        $set: {
          isApproved,
        },
      }
    );

    if (updated.modifiedCount > 0)
      return res.status(201).json({
        success: 1,
        message: "Data updated successfully",
      });

    if (updated.modifiedCount <= 0)
      return res.status(400).json({
        success: 0,
        message: "Could not update user",
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
    const agentID = req.body.agentID;
    const deleted = await Property.findByIdAndDelete({ _id: req.params.ID });

    if (deleted) {
      const agent = await Agent.findOne({ _id: agentID });

      const newpropert = await agent.properties.filter(
        (property) => property.propertyID !== req.params.ID
      );

      await Agent.updateOne(
        {
          _id: agentID,
        },
        {
          $set: {
            properties: newpropert,
          },
        }
      );
      return res.status(200).json({
        success: 1,
        message: "Data removed successfully",
      });
    }

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

router.delete("/sell/:ID", async (req, res) => {
  try {
    const agentID = req.body.agentID;
    const deleted = await Property.findByIdAndDelete({ _id: req.params.ID });

    if (deleted) {
      const agent = await Agent.findOne({ _id: agentID });

      const newpropert = await agent.properties.filter(
        (property) => property.propertyID !== req.params.ID
      );

      const deals = parseInt(agent.deals) + 1;

      await Agent.updateOne(
        {
          _id: agentID,
        },
        {
          $set: {
            deals: JSON.stringify(deals),
            properties: newpropert,
          },
        }
      );
      return res.status(200).json({
        success: 1,
        message: "Property sold!",
      });
    }

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

router.post("/create", upload.array("propImage"), async (req, res) => {
  try {
    var images = {
      image1: "",
      image2: "",
      image3: "",
      image4: "",
      image5: "",
    };
    const url = req.protocol + "://" + req.get("host");
    
    // Improved error handling for image files
    if (req.files && req.files.length > 0) {
      images.image1 = req.files[0] ? url + "/public/" + req.files[0].filename : "";
      images.image2 = req.files[1] ? url + "/public/" + req.files[1].filename : "";
      images.image3 = req.files[2] ? url + "/public/" + req.files[2].filename : "";
      images.image4 = req.files[3] ? url + "/public/" + req.files[3].filename : "";
      images.image5 = req.files[4] ? url + "/public/" + req.files[4].filename : "";
    } else {
      console.log("No image files uploaded");
    }

    const data = await JSON.parse(req.body.data);
    const {
      propName,
      propLoca,
      propType,
      rentOrSale,
      price,
      rooms,
      sqft,
      propDesc,
      address,
      year,
      agentID,
      dRoom,
      kitchen,
      bedRoomNumber,
      bathRoomNumber,
      livRoom,
      mBedroom,
      porch,
      carPark,
      stRoom,
      pool,
      ppWater,
      acon,
      elct,
      nmRoad,
      nsMarket,
      pets,
      // Extract new location fields if they exist
      country,
      province,
      city,
      suburb
    } = data;

    const others = {
      diningRoom: dRoom,
      kitchen,
      bathrooms: bathRoomNumber,
      masterBedroom: mBedroom,
      noOfBedrooms: bedRoomNumber,
      livingRoom: livRoom,
      porch,
      carPark,
      storeRoom: stRoom,
      available: true,
    };

    const amenities = {
      pipeWater: ppWater === undefined ? false : ppWater,
      electricity: elct === undefined ? false : elct,
      swimmingPool: pool === undefined ? false : pool,
      airCondition: acon === undefined ? false : acon,
      nearMainRoad: nmRoad === undefined ? false : nmRoad,
      nearSuperMarket: nsMarket === undefined ? false : nsMarket,
      petsAllowed: pets === undefined ? false : pets,
    };

    const property = new Property({
      name: propName,
      location: propLoca,
      propType,
      rentOrSale,
      price,
      numberOfRooms: rooms,
      squareFt: sqft,
      propDescription: propDesc,
      digitalAddress: address,
      yearBuilt: year,
      agentID,
      // Add new location fields
      country: country || "",
      province: province || "",
      city: city || "",
      suburb: suburb || "",
      others,
      isApproved: false,
      amenities,
      images,
    });

    const savedProp = await property.save();

    if (savedProp) {
      const agent = await Agent.findById({ _id: savedProp.agentID });
      var propt = { propertyID: savedProp._id };
      const newProps = [...agent.properties, propt];
      const saveId = await Agent.updateOne(
        { _id: agentID },
        {
          $set: {
            properties: newProps,
          },
        }
      );

      return res.status(201).json({
        success: 1,
        message: "Data created successfully",
      });
    }

    if (!savedProp)
      return res.status(400).json({
        success: 0,
        message: "Could not save property",
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
