const config = require("../config");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database, {});
    console.log(`MongoDB connected :${conn.connection.host}`);
  } catch (error) {
    console.error(`error${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
