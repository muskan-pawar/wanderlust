const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");

    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner:'697482376d75d413f4129b59'}));
    await Listing.insertMany(initData.data);

    console.log("data was initialized");
  } catch (err) {
    console.log(err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
