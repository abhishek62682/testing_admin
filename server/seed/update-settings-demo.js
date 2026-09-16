require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Settings = require("../models/Settings");

async function main() {
  await connectDB();
  const settings = await Settings.getSingleton();
  Object.assign(settings, {
    businessName: "Test Studio",
    email: "test@example.com",
    phone: "+91 90000 00000",
    whatsapp: "919000000000",
    address: "123 Test Street, Test City – 000000",
    social: {
      instagram: "https://instagram.com/example",
      facebook: "https://facebook.com/example",
      linkedin: "https://linkedin.com/company/example",
    },
    seoTitle: "Test Studio | Interior Design & Civil Engineering (Demo)",
    seoDescription: "This is a demo/testing site for Test Studio, a sample interior design and civil engineering studio.",
    footerAbout: "This is placeholder text for a demo interior design & civil engineering studio, used for testing purposes only.",
    footerCopyright: "© 2026 Test Studio · Demo Site",
  });
  await settings.save();
  console.log("Settings updated to placeholder/test values");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
