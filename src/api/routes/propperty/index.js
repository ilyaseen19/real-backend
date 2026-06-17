const express = require("express");
const mongoose = require("mongoose");
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

router.patch("/update/:ID", upload.array("propImage"), async (req, res) => {
  try {
    const _id = req.params.ID;
    const property = await Property.findById(_id);

    if (!property) {
      return res.status(404).json({
        success: 0,
        message: "Property not found",
      });
    }

    const payload = req.body?.data ? JSON.parse(req.body.data) : req.body;
    const {
      propName,
      propLoca,
      propType,
      rentOrSale,
      price,
      rooms,
      sqft,
      areaValue,
      areaUnit,
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
      country,
      province,
      city,
      suburb,
      currency,
      existingImages,
      shortStayMinimumNights,
      shortStayCheckInTime,
      shortStayCheckOutTime,
      shortStayAvailabilityStart,
      shortStayAvailabilityEnd,
      shortStayBlockedDates,
      shortStay,
      isApproved,
    } = payload || {};

    const settingsDoc = await Settings.findOne();
    const settings = normalizeSettings(settingsDoc ? settingsDoc.toObject() : {});
    const resolvedCountryName = country || property.country || "";
    const selectedCountry = getCountryConfig(settings, resolvedCountryName);

    if (!selectedCountry) {
      return res.status(400).json({
        success: 0,
        message: "Select a valid country configured in settings",
      });
    }

    const normalizedAgentID = String(agentID || property.agentID || "").trim();

    if (!normalizedAgentID || !mongoose.Types.ObjectId.isValid(normalizedAgentID)) {
      return res.status(400).json({
        success: 0,
        message: "Property must be attached to a valid agent account",
      });
    }

    const assignedAgent = await Agent.findById(normalizedAgentID);

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
    const resolvedCurrency = currency || property.currency || selectedCountry.defaultCurrency;

    if (!allowedCurrencies.includes(resolvedCurrency)) {
      return res.status(400).json({
        success: 0,
        message: `Allowed currencies for ${selectedCountry.name} are ${allowedCurrencies.join(", ")}`,
      });
    }

    const url = req.protocol + "://" + req.get("host");
    const uploadedGallery = Array.isArray(req.files)
      ? req.files.map((file) => url + "/public/" + file.filename)
      : [];
    const currentImages = [
      property.images?.image1,
      property.images?.image2,
      property.images?.image3,
      property.images?.image4,
      property.images?.image5,
      ...(Array.isArray(property.images?.gallery) ? property.images.gallery : []),
    ].filter(Boolean);
    const nextGallery =
      uploadedGallery.length > 0
        ? uploadedGallery
        : Array.isArray(existingImages) && existingImages.length > 0
          ? existingImages.filter(Boolean)
          : currentImages;

    if (nextGallery.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Please upload at least one image",
      });
    }

    const normalizedRentOrSale = normalizeListingMode(rentOrSale || property.rentOrSale);
    const isShortStayListing = normalizedRentOrSale === "Short Stay";
    const shortStayOpenDates = shortStay?.openDates
      ? normalizeDateList(shortStay.openDates)
      : buildDateRange(
          shortStayAvailabilityStart || property.shortStay?.openDates?.[0],
          shortStayAvailabilityEnd ||
            property.shortStay?.openDates?.[property.shortStay?.openDates?.length - 1]
        );
    const shortStayBlockedDateList = shortStay?.blockedDates
      ? normalizeDateList(shortStay.blockedDates)
      : normalizeDateList(shortStayBlockedDates || property.shortStay?.blockedDates);

    if (isShortStayListing && shortStayOpenDates.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Short stay listings need an available date range",
      });
    }

    const normalizedAreaValue = String(
      areaValue || property.areaValue || sqft || property.squareFt || ""
    ).trim();
    const normalizedAreaUnit = String(areaUnit || property.areaUnit || "").trim();
    const formattedArea = normalizedAreaValue
      ? `${normalizedAreaValue}${normalizedAreaUnit ? ` ${normalizedAreaUnit}` : ""}`.trim()
      : "";

    const updateFields = {
      name: propName || property.name,
      location: propLoca || property.location,
      propType: propType || property.propType,
      rentOrSale: normalizedRentOrSale,
      price: price !== undefined && price !== "" ? price : property.price,
      currency: resolvedCurrency,
      currencySymbol:
        resolvedCurrency === settings.general.defaultCurrency
          ? settings.general.defaultCurrencySymbol
          : resolvedCurrency,
      numberOfRooms: rooms !== undefined && rooms !== "" ? rooms : property.numberOfRooms,
      areaValue: normalizedAreaValue,
      areaUnit: normalizedAreaUnit,
      squareFt: formattedArea,
      propDescription: propDesc || property.propDescription,
      digitalAddress: address || property.digitalAddress,
      yearBuilt: year !== undefined ? year : property.yearBuilt,
      agentID: normalizedAgentID,
      country: resolvedCountryName,
      province: province !== undefined ? province : property.province,
      city: city !== undefined ? city : property.city,
      suburb: suburb !== undefined ? suburb : property.suburb,
      isApproved: typeof isApproved === "boolean" ? isApproved : property.isApproved,
      others: {
        diningRoom: dRoom !== undefined ? dRoom : property.others?.diningRoom,
        kitchen: kitchen !== undefined ? kitchen : property.others?.kitchen,
        bathrooms:
          bathRoomNumber !== undefined && bathRoomNumber !== ""
            ? bathRoomNumber
            : property.others?.bathrooms,
        masterBedroom: mBedroom !== undefined ? mBedroom : property.others?.masterBedroom,
        noOfBedrooms:
          bedRoomNumber !== undefined && bedRoomNumber !== ""
            ? bedRoomNumber
            : property.others?.noOfBedrooms,
        livingRoom: livRoom !== undefined ? livRoom : property.others?.livingRoom,
        porch: porch !== undefined ? porch : property.others?.porch,
        carPark: carPark !== undefined ? carPark : property.others?.carPark,
        storeRoom: stRoom !== undefined ? stRoom : property.others?.storeRoom,
        available:
          property.others?.available === undefined ? true : property.others.available,
      },
      amenities: {
        pipeWater: ppWater !== undefined ? ppWater : property.amenities?.pipeWater,
        electricity: elct !== undefined ? elct : property.amenities?.electricity,
        swimmingPool: pool !== undefined ? pool : property.amenities?.swimmingPool,
        airCondition: acon !== undefined ? acon : property.amenities?.airCondition,
        nearMainRoad: nmRoad !== undefined ? nmRoad : property.amenities?.nearMainRoad,
        nearSuperMarket:
          nsMarket !== undefined ? nsMarket : property.amenities?.nearSuperMarket,
        petsAllowed: pets !== undefined ? pets : property.amenities?.petsAllowed,
      },
      shortStay: {
        enabled: isShortStayListing,
        minimumNights: isShortStayListing
          ? Number(shortStayMinimumNights || shortStay?.minimumNights) || 1
          : 1,
        checkInTime: isShortStayListing
          ? shortStayCheckInTime || shortStay?.checkInTime || property.shortStay?.checkInTime || "14:00"
          : "14:00",
        checkOutTime: isShortStayListing
          ? shortStayCheckOutTime || shortStay?.checkOutTime || property.shortStay?.checkOutTime || "11:00"
          : "11:00",
        openDates: isShortStayListing ? shortStayOpenDates : [],
        blockedDates: isShortStayListing ? shortStayBlockedDateList : [],
        bookedDates: normalizeDateList(property.shortStay?.bookedDates),
      },
      images: {
        image1: nextGallery[0] || "",
        image2: nextGallery[1] || "",
        image3: nextGallery[2] || "",
        image4: nextGallery[3] || "",
        image5: nextGallery[4] || "",
        gallery: nextGallery,
      },
    };

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
    const url = req.protocol + "://" + req.get("host");
    const galleryImages = Array.isArray(req.files)
      ? req.files.map((file) => url + "/public/" + file.filename)
      : [];
    var images = {
      image1: "",
      image2: "",
      image3: "",
      image4: "",
      image5: "",
      gallery: galleryImages,
    };

    // Improved error handling for image files
    if (galleryImages.length > 0) {
      images.image1 = galleryImages[0] || "";
      images.image2 = galleryImages[1] || "";
      images.image3 = galleryImages[2] || "";
      images.image4 = galleryImages[3] || "";
      images.image5 = galleryImages[4] || "";
    } else {
      return res.status(400).json({
        success: 0,
        message: "Please upload at least one image",
      });
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
      areaValue,
      areaUnit,
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

    const normalizedAgentID = String(agentID || "").trim();

    if (!normalizedAgentID) {
      return res.status(400).json({
        success: 0,
        message: "Property must be attached to an agent account",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(normalizedAgentID)) {
      return res.status(400).json({
        success: 0,
        message: "Invalid agent account selected for this property",
      });
    }

    const assignedAgent = await Agent.findById(normalizedAgentID);

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

    const normalizedAreaValue = String(areaValue || sqft || "").trim();
    const normalizedAreaUnit = String(areaUnit || "").trim();
    const formattedArea = normalizedAreaValue
      ? `${normalizedAreaValue}${normalizedAreaUnit ? ` ${normalizedAreaUnit}` : ""}`.trim()
      : "";

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
      areaValue: normalizedAreaValue,
      areaUnit: normalizedAreaUnit,
      squareFt: formattedArea,
      propDescription: propDesc,
      digitalAddress: address,
      yearBuilt: year || "",
      agentID: normalizedAgentID,
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
        { _id: normalizedAgentID },
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
