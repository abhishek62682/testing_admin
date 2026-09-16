const mongoose = require("mongoose");

const GalleryItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", GalleryItemSchema);
