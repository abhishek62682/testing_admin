const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Test Studio" },
    email: { type: String, default: "test@example.com" },
    phone: { type: String, default: "+91 90000 00000" },
    whatsapp: { type: String, default: "919000000000" },
    address: { type: String, default: "123 Test Street, Test City – 000000" },

    social: {
      instagram: { type: String, default: "https://instagram.com/example" },
      facebook: { type: String, default: "https://facebook.com/example" },
      linkedin: { type: String, default: "https://linkedin.com/company/example" },
    },

    heroImage: { type: String, default: "https://framerusercontent.com/images/y4pwQVVExvdnuPBh88wp6zMfM.png?width=5504&height=3072" },
    heroTitle: { type: String, default: "Designing  Timeless Spaces with Precision  & Passion." },
    heroDescription: { type: String, default: "Interior Design & Civil Engineering Solutions — thoughtfully crafted spaces built with precision, quality, and a passion for detail." },
    heroStudioLocation: { type: String, default: "Test Studio, Test City" },
    heroEstSince: { type: String, default: "2016" },
    heroSpeciality: { type: String, default: "Residential & Commercial" },
    heroRating: { type: String, default: "4.9+" },

    aboutTagline: { type: String, default: "Where design meets everyday living." },
    aboutContent: {
      type: String,
      default:
        "Our studio is driven by a belief that great design begins with understanding how a space is truly lived in. We take the time to listen, observe, and translate our clients' needs into interiors that feel both intentional and intuitive. Through careful space planning, material selection, and attention to detail, we create environments that balance beauty with functionality. Each project is approached as a collaboration, resulting in spaces that are not only visually refined, but deeply comfortable, personal, and designed to stand the test of time.",
    },

    ctaTitle: { type: String, default: "Have a project in mind?" },
    ctaDescription: { type: String, default: "Tell us about your space and we'll put together a plan and a tentative estimate." },
    ctaButtonText: { type: String, default: "Get in Touch" },
    ctaButtonLink: { type: String, default: "/contact" },

    footerAbout: {
      type: String,
      default:
        "This is placeholder text for a demo interior design & civil engineering studio, used for testing purposes only.",
    },
    footerCopyright: { type: String, default: "© 2026 Test Studio · Demo Site" },

    seoTitle: { type: String, default: "Test Studio | Interior Design & Civil Engineering (Demo)" },
    seoDescription: {
      type: String,
      default:
        "This is a demo/testing site for Test Studio, a sample interior design and civil engineering studio.",
    },
  },
  { timestamps: true }
);

SettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("Settings", SettingsSchema);
