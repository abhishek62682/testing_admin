require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");
async function main() {
  await connectDB();
  const r = await Admin.deleteOne({ username: "admin" });
  console.log("Removed old admin account:", r.deletedCount);
  await mongoose.disconnect();
}
main();
