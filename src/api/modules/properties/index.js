const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    // Added new location fields to match frontend filters
    country: {
      type: String,
      required: false,
      trim: true,
    },
    province: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    suburb: {
      type: String,
      required: false,
      trim: true,
    },
    propType: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    rentOrSale: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: false,
      trim: true,
    },
    currencySymbol: {
      type: String,
      required: false,
      trim: true,
    },
    shortStay: {
      enabled: {
        type: Boolean,
        default: false,
      },
      minimumNights: {
        type: Number,
        default: 1,
      },
      checkInTime: {
        type: String,
        default: "14:00",
        trim: true,
      },
      checkOutTime: {
        type: String,
        default: "11:00",
        trim: true,
      },
      openDates: {
        type: [String],
        default: [],
      },
      blockedDates: {
        type: [String],
        default: [],
      },
      bookedDates: {
        type: [String],
        default: [],
      },
    },
    numberOfRooms: {
      type: Number,
      required: true,
    },
    areaValue: {
      type: String,
      required: false,
      trim: true,
    },
    areaUnit: {
      type: String,
      required: false,
      trim: true,
    },
    squareFt: {
      type: String,
      required: false,
      trim: true,
    },
    propDescription: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    digitalAddress: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    yearBuilt: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    agentID: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      required: true,
    },
    others: {
      diningRoom: {
        type: Boolean,
        required: true,
      },
      livingRoom: {
        type: Boolean,
        required: true,
      },
      kitchen: {
        type: Boolean,
        required: true,
      },
      bathrooms: {
        type: Number,
        required: true,
      },
      masterBedroom: {
        type: Boolean,
        required: true,
      },
      noOfBedrooms: {
        type: Number,
        required: true,
      },
      porch: {
        type: Boolean,
        required: true,
      },
      carPark: {
        type: Boolean,
        required: true,
      },
      storeRoom: {
        type: Boolean,
        required: true,
      },
      available: {
        type: Boolean,
        required: true,
      },
    },
    amenities: {
      pipeWater: {
        type: Boolean,
        required: true,
      },
      electricity: {
        type: Boolean,
        required: true,
      },
      swimmingPool: {
        type: Boolean,
        required: true,
      },
      airCondition: {
        type: Boolean,
        required: true,
      },
      nearMainRoad: {
        type: Boolean,
        required: true,
      },
      nearSuperMarket: {
        type: Boolean,
        required: true,
      },
      petsAllowed: {
        type: Boolean,
        required: true,
      },
    },
    images: {
      image1: {
        type: String,
        required: false,
      },
      image2: {
        type: String,
        required: false,
      },
      image3: {
        type: String,
        required: false,
      },
      image4: {
        type: String,
        required: false,
      },
      image5: {
        type: String,
        required: false,
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
