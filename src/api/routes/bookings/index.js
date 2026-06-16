const express = require("express");
const Property = require("../../modules/properties");
const ShortStayBooking = require("../../modules/shortStayBookings");

const router = express.Router();

const normalizeDateValue = (value) => {
  if (!value) return "";
  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) return "";
  return normalized.toISOString().split("T")[0];
};

const buildStayDates = (checkInDate, checkOutDate) => {
  const checkIn = normalizeDateValue(checkInDate);
  const checkOut = normalizeDateValue(checkOutDate);

  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return [];
  }

  const dates = [];
  const current = new Date(checkIn);
  const departure = new Date(checkOut);

  while (current < departure) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

router.post("/short-stay", async (req, res) => {
  try {
    const {
      propertyId,
      userID,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guests = 1,
      paymentMethod = "",
      message = "",
    } = req.body;

    if (!propertyId || !userID || !name || !email || !phone || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: 0,
        message: "All booking fields are required",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: 0,
        message: "Property not found",
      });
    }

    if (String(property.rentOrSale || "").toLowerCase() !== "short stay") {
      return res.status(400).json({
        success: 0,
        message: "This property is not available for short stay booking",
      });
    }

    const stayDates = buildStayDates(checkInDate, checkOutDate);
    if (stayDates.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Choose a valid check-in and check-out date",
      });
    }

    const minimumNights = Number(property.shortStay?.minimumNights || 1);
    if (stayDates.length < minimumNights) {
      return res.status(400).json({
        success: 0,
        message: `This short stay requires at least ${minimumNights} night(s)`,
      });
    }

    const openDates = new Set(property.shortStay?.openDates || []);
    const blockedDates = new Set(property.shortStay?.blockedDates || []);
    const bookedDates = new Set(property.shortStay?.bookedDates || []);
    const invalidDate = stayDates.find(
      (date) => !openDates.has(date) || blockedDates.has(date) || bookedDates.has(date)
    );

    if (invalidDate) {
      return res.status(400).json({
        success: 0,
        message: "One or more selected dates are no longer available",
      });
    }

    const booking = await ShortStayBooking.create({
      propertyId: String(property._id),
      propertyName: property.name,
      agentID: property.agentID,
      userID,
      name,
      email,
      phone,
      checkInDate: normalizeDateValue(checkInDate),
      checkOutDate: normalizeDateValue(checkOutDate),
      nights: stayDates.length,
      nightlyRate: Number(property.price || 0),
      totalAmount: Number(property.price || 0) * stayDates.length,
      currency: property.currency || "",
      paymentMethod,
      guests: Number(guests) || 1,
      message,
      bookedDates: stayDates,
      status: "Booked",
    });

    property.shortStay = {
      ...(property.shortStay?.toObject ? property.shortStay.toObject() : property.shortStay),
      enabled: true,
      minimumNights,
      bookedDates: [...new Set([...(property.shortStay?.bookedDates || []), ...stayDates])].sort(),
      openDates: [...new Set(property.shortStay?.openDates || [])].sort(),
      blockedDates: [...new Set(property.shortStay?.blockedDates || [])].sort(),
      checkInTime: property.shortStay?.checkInTime || "14:00",
      checkOutTime: property.shortStay?.checkOutTime || "11:00",
    };

    await property.save();

    return res.status(201).json({
      success: 1,
      message: "Short stay booked successfully",
      data: {
        bookingId: String(booking._id),
        nights: booking.nights,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookedDates: booking.bookedDates,
      },
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
