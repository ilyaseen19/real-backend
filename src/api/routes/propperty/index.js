const express = require("express");
const Property = require("../../modules/properties");
const Agent = require("../../modules/agents");
const { upload } = require("../../middlewares/imageUpload");
const Settings = require("../../modules/settings");
const { normalizeSettings, getCountryConfig, getAllowedCurrencies } = require("../../libs/siteSettings");

const router = express.Router();

const normalizeListingMode = (value) => {
  const mode = String(value || "").trim().toLowerCase();

  if (mode === "sale") return "Sale";
  if (mode === "rent") return "Rent";
  if (mode === "short stay" || mode === "short-stay" || mode === "shortstay") {
    return "Short Stay";
  }

  return value;
};

const normalizeDateValue = (value) => {
  if (!value) return "";
  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) return "";
  return normalized.toISOString().split("T")[0];
};

const normalizeDateList = (value) => {
  if (!value) return [];

  const values = Array.isArray(value)
    ? value
    : String(value)
        .split(/[\n,]+/)
        .map((item) => item.trim());

  return [...new Set(values.map(normalizeDateValue).filter(Boolean))].sort();
};

const buildDateRange = (start, end) => {
  const startDate = normalizeDateValue(start);
  const endDate = normalizeDateValue(end);

  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const dates = [];
  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

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
    const property = await Property.findById(_id);

    if (!property) {
      return res.status(404).json({
        success: 0,
        message: "Property not found",
      });
    }

    const updateFields = {};
    if (typeof req.body.isApproved === "boolean") {
      updateFields.isApproved = req.body.isApproved;
    }

    if (req.body.shortStay) {
      const currentShortStay = property.shortStay || {};
      const nextShortStay = {
        enabled:
          req.body.shortStay.enabled !== undefined
            ? !!req.body.shortStay.enabled
            : !!currentShortStay.enabled,
        minimumNights:
          req.body.shortStay.minimumNights !== undefined
            ? Number(req.body.shortStay.minimumNights) || 1
            : currentShortStay.minimumNights || 1,
        checkInTime:
          req.body.shortStay.checkInTime || currentShortStay.checkInTime || "14:00",
        checkOutTime:
          req.body.shortStay.checkOutTime || currentShortStay.checkOutTime || "11:00",
        openDates:
          req.body.shortStay.openDates !== undefined
            ? normalizeDateList(req.body.shortStay.openDates)
            : normalizeDateList(currentShortStay.openDates),
        blockedDates:
          req.body.shortStay.blockedDates !== undefined
            ? normalizeDateList(req.body.shortStay.blockedDates)
            : normalizeDateList(currentShortStay.blockedDates),
        bookedDates:
          req.body.shortStay.bookedDates !== undefined
            ? normalizeDateList(req.body.shortStay.bookedDates)
            : normalizeDateList(currentShortStay.bookedDates),
      };

      updateFields.shortStay = nextShortStay;
      updateFields.rentOrSale =
        normalizeListingMode(req.body.rentOrSale || property.rentOrSale) || property.rentOrSale;
    }

    const updated = await Property.updateOne({ _id }, { $set: updateFields });

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
      suburb,
      currency,
      shortStayMinimumNights,
      shortStayCheckInTime,
      shortStayCheckOutTime,
      shortStayAvailabilityStart,
      shortStayAvailabilityEnd,
      shortStayBlockedDates,
    } = data;

    const settingsDoc = await Settings.findOne();
    const settings = normalizeSettings(settingsDoc ? settingsDoc.toObject() : {});
    const selectedCountry = getCountryConfig(settings, country);

    if (!selectedCountry) {
      return res.status(400).json({
        success: 0,
        message: "Select a valid country configured in settings",
      });
    }

    const assignedAgent = await Agent.findById(agentID);

    if (!assignedAgent) {
      return res.status(404).json({
        success: 0,
        message: "Assigned agent not found",
      });
    }

    if (
      assignedAgent.country &&
      assignedAgent.country.toLowerCase() !== selectedCountry.name.toLowerCase()
    ) {
      return res.status(400).json({
        success: 0,
        message: "The property country must match the assigned agent country",
      });
    }

    const allowedCurrencies = getAllowedCurrencies(selectedCountry, settings);
    const resolvedCurrency = currency || selectedCountry.defaultCurrency;

    if (!allowedCurrencies.includes(resolvedCurrency)) {
      return res.status(400).json({
        success: 0,
        message: `Allowed currencies for ${selectedCountry.name} are ${allowedCurrencies.join(", ")}`,
      });
    }

    const normalizedRentOrSale = normalizeListingMode(rentOrSale);
    const isShortStay = normalizedRentOrSale === "Short Stay";
    const shortStayOpenDates = buildDateRange(
      shortStayAvailabilityStart,
      shortStayAvailabilityEnd
    );
    const shortStayBlockedDateList = normalizeDateList(shortStayBlockedDates);

    if (isShortStay && shortStayOpenDates.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Short stay listings need an available date range",
      });
    }

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
      rentOrSale: normalizedRentOrSale,
      price,
      currency: resolvedCurrency,
      currencySymbol:
        resolvedCurrency === settings.general.defaultCurrency
          ? settings.general.defaultCurrencySymbol
          : resolvedCurrency,
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
      shortStay: {
        enabled: isShortStay,
        minimumNights: isShortStay ? Number(shortStayMinimumNights) || 1 : 1,
        checkInTime: isShortStay ? shortStayCheckInTime || "14:00" : "14:00",
        checkOutTime: isShortStay ? shortStayCheckOutTime || "11:00" : "11:00",
        openDates: isShortStay ? shortStayOpenDates : [],
        blockedDates: isShortStay ? shortStayBlockedDateList : [],
        bookedDates: [],
      },
      others,
      isApproved: false,
      amenities,
      images,
    });

    const savedProp = await property.save();

    if (savedProp) {
      var propt = { propertyID: savedProp._id };
      const newProps = [...(assignedAgent.properties || []), propt];
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
