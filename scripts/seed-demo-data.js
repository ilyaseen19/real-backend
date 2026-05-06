const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const Admin = require("../src/api/modules/admin");
const Agent = require("../src/api/modules/agents");
const Property = require("../src/api/modules/properties");
const { _encrypt } = require("../src/api/libs/encrypt");

const adminEmail = "admin@realesate.com";
const adminPassword = "Realadmin$2026";

const demoPropertyNames = [
  "Aurora Heights Apartment",
  "Palm Grove Family Villa",
  "Cedar Court Townhouse",
  "Skyline Executive Loft",
];

const imageBase = `http://localhost:${process.env.PORT || 8900}/public/`;

const demoProperties = [
  {
    name: "Aurora Heights Apartment",
    location: "East Legon, Accra",
    country: "Ghana",
    province: "Greater Accra",
    city: "Accra",
    suburb: "East Legon",
    propType: "Apartment",
    rentOrSale: "Rent",
    price: 8500,
    numberOfRooms: 5,
    squareFt: 1450,
    propDescription:
      "Bright apartment with modern finishes, strong natural light, a spacious lounge, and quick access to major roads.",
    digitalAddress: "GL-143-8890",
    yearBuilt: "2022",
    isApproved: true,
    images: {
      image1: `${imageBase}24d01a0d-f335-406f-8a74-fc9b882f020c-nick-romanov-_hw4auq81ic-unsplash.jpg`,
      image2: `${imageBase}66245f67-c393-439a-b0d0-f60fe11cc349-nick-romanov-_hw4auq81ic-unsplash.jpg`,
      image3: `${imageBase}e21fce99-c299-43a6-9f2d-c1db14353b11-nick-romanov-_hw4auq81ic-unsplash.jpg`,
      image4: "",
      image5: "",
    },
    others: {
      diningRoom: true,
      livingRoom: true,
      kitchen: true,
      bathrooms: 2,
      masterBedroom: true,
      noOfBedrooms: 3,
      porch: true,
      carPark: true,
      storeRoom: true,
      available: true,
    },
    amenities: {
      pipeWater: true,
      electricity: true,
      swimmingPool: false,
      airCondition: true,
      nearMainRoad: true,
      nearSuperMarket: true,
      petsAllowed: false,
    },
  },
  {
    name: "Palm Grove Family Villa",
    location: "Trasacco, Accra",
    country: "Ghana",
    province: "Greater Accra",
    city: "Accra",
    suburb: "Trasacco",
    propType: "Villa",
    rentOrSale: "Sale",
    price: 1850000,
    numberOfRooms: 9,
    squareFt: 4200,
    propDescription:
      "Large family villa with premium finishes, a private compound, wide living spaces, and multiple outdoor relaxation areas.",
    digitalAddress: "GA-552-1120",
    yearBuilt: "2021",
    isApproved: true,
    images: {
      image1: `${imageBase}1b661823-81e7-4abb-bc4c-db2bed0606ca-r-architecture-2gdwliim3uw-unsplash.jpg`,
      image2: `${imageBase}458ef745-b9e5-4f71-b230-41c866ea3083-r-architecture-2gdwliim3uw-unsplash.jpg`,
      image3: `${imageBase}d4e6f06e-0b49-4c22-af4c-36990e8113d7-r-architecture-2gdwliim3uw-unsplash.jpg`,
      image4: "",
      image5: "",
    },
    others: {
      diningRoom: true,
      livingRoom: true,
      kitchen: true,
      bathrooms: 4,
      masterBedroom: true,
      noOfBedrooms: 5,
      porch: true,
      carPark: true,
      storeRoom: true,
      available: true,
    },
    amenities: {
      pipeWater: true,
      electricity: true,
      swimmingPool: true,
      airCondition: true,
      nearMainRoad: true,
      nearSuperMarket: false,
      petsAllowed: true,
    },
  },
  {
    name: "Cedar Court Townhouse",
    location: "Spintex, Accra",
    country: "Ghana",
    province: "Greater Accra",
    city: "Accra",
    suburb: "Spintex",
    propType: "Townhouse",
    rentOrSale: "Sale",
    price: 940000,
    numberOfRooms: 7,
    squareFt: 2600,
    propDescription:
      "Contemporary townhouse in a secure neighborhood with balanced indoor space, parking, and access to daily essentials.",
    digitalAddress: "GS-882-7741",
    yearBuilt: "2020",
    isApproved: true,
    images: {
      image1: `${imageBase}419a3f43-6c56-4fcb-861f-86f07fed7684-james-bold-uxcs2kvhztc-unsplash.jpg`,
      image2: `${imageBase}8c15648c-456b-4b39-af80-21b2d62b1b18-james-bold-uxcs2kvhztc-unsplash.jpg`,
      image3: `${imageBase}f3549d49-58ea-45e5-9840-9b6f1c4c95c0-james-bold-uxcs2kvhztc-unsplash.jpg`,
      image4: "",
      image5: "",
    },
    others: {
      diningRoom: true,
      livingRoom: true,
      kitchen: true,
      bathrooms: 3,
      masterBedroom: true,
      noOfBedrooms: 4,
      porch: false,
      carPark: true,
      storeRoom: false,
      available: true,
    },
    amenities: {
      pipeWater: true,
      electricity: true,
      swimmingPool: false,
      airCondition: true,
      nearMainRoad: true,
      nearSuperMarket: true,
      petsAllowed: true,
    },
  },
  {
    name: "Skyline Executive Loft",
    location: "Airport Residential, Accra",
    country: "Ghana",
    province: "Greater Accra",
    city: "Accra",
    suburb: "Airport Residential",
    propType: "Loft",
    rentOrSale: "Rent",
    price: 12500,
    numberOfRooms: 4,
    squareFt: 1320,
    propDescription:
      "Executive loft with a polished interior, smart layout, easy commute access, and a premium feel suited for professionals.",
    digitalAddress: "AR-303-9918",
    yearBuilt: "2023",
    isApproved: true,
    images: {
      image1: `${imageBase}62b97dab-9b15-4cde-9754-3501e115339d-vu-anh-tivptycg_3e-unsplash.jpg`,
      image2: `${imageBase}d7b263bc-19df-40a6-84ba-72d6b2e662da-vu-anh-tivptycg_3e-unsplash.jpg`,
      image3: `${imageBase}e506dc84-a59a-47de-a702-5aa8c7828418-vu-anh-tivptycg_3e-unsplash.jpg`,
      image4: "",
      image5: "",
    },
    others: {
      diningRoom: false,
      livingRoom: true,
      kitchen: true,
      bathrooms: 2,
      masterBedroom: true,
      noOfBedrooms: 2,
      porch: true,
      carPark: true,
      storeRoom: false,
      available: true,
    },
    amenities: {
      pipeWater: true,
      electricity: true,
      swimmingPool: false,
      airCondition: true,
      nearMainRoad: true,
      nearSuperMarket: true,
      petsAllowed: false,
    },
  },
];

async function seedDemoData() {
  await mongoose.connect(process.env.MONGO_URI, {});

  try {
    const encryptedPassword = await _encrypt(adminPassword);

    await Admin.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          firstName: "REAL",
          lastName: "ADMIN",
          phone: "0000000000",
          email: adminEmail,
          password: encryptedPassword,
          address: "System Generated Account",
          image: "",
          role: "Admin",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const firstAgent = await Agent.findOne().lean();
    const agentID = firstAgent ? String(firstAgent._id) : "demo-agent";

    await Property.deleteMany({ name: { $in: demoPropertyNames } });

    const seededPayload = demoProperties.map((property) => ({
      ...property,
      agentID,
    }));

    const inserted = await Property.insertMany(seededPayload);

    console.log(`Admin account ensured for ${adminEmail}`);
    console.log(`Seeded ${inserted.length} demo properties`);
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
