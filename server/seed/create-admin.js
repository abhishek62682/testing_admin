require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

async function main() {
  const [, , username, email, password] = process.argv;
  if (!username || !email || !password) {
    console.log("Usage: node create-admin.js <username> <email> <password>");
    process.exit(1);
  }

  await connectDB();

  let admin = await Admin.findOne({ $or: [{ username }, { email }] });
  if (admin) {
    await admin.setPassword(password);
    admin.username = username;
    admin.email = email;
    await admin.save();
    console.log(`Updated existing admin: ${username}`);
  } else {
    admin = new Admin({ username, email });
    await admin.setPassword(password);
    await admin.save();
    console.log(`Created admin: ${username}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
