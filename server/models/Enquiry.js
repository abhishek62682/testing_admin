const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["contact", "cost-calculator"], required: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    area: { type: String, default: "" },
    bhk: { type: String, default: "" },
    package: { type: String, default: "" },
    estimatedTotal: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", EnquirySchema);
