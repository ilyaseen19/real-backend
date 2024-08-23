// import dotenv from "dotenv";
const dotenv = require("dotenv")
dotenv.config();

module.exports = {
    database: process.env.MONGO_URI,
    server: {
      port: process.env.PORT || 8900,
    },
  
    //reduse expiry time
    jwt: {
      secret: 'djkfsnf63',
      expiresIn: '365d',
    },
  };
  
