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
    numberOfRooms: {
      type: Number,
      required: true,
    },
    squareFt: {
      type: Number,
      required: false,
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
      required: true,
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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
