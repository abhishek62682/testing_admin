const express = require("express");
const router = express.Router();

const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");
const TeamMember = require("../models/TeamMember");
const Project = require("../models/Project");
const GalleryItem = require("../models/GalleryItem");
const Enquiry = require("../models/Enquiry");

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/", async (req, res) => {
  const [projects, homeServices, testimonials] = await Promise.all([
    Project.find({ published: true }).sort({ order: 1, createdAt: 1 }).limit(3),
    Service.find({ published: true }).sort({ order: 1, createdAt: 1 }).limit(3),
    Testimonial.find({ published: true }).sort({ order: 1, createdAt: 1 }),
  ]);
  res.render("pages/index", {
    projects,
    homeServices,
    testimonials,
    canonicalUrl: baseUrl(req) + "/",
    pageTitle: null,
    pageDescription: null,
  });
});

router.get("/about", async (req, res) => {
  const team = await TeamMember.find({ published: true }).sort({ order: 1, createdAt: 1 });
  res.render("pages/about", {
    team,
    canonicalUrl: baseUrl(req) + "/about",
    pageTitle: `${res.locals.settings.businessName} | About`,
    pageDescription: `Meet ${res.locals.settings.businessName} — our story, team and design philosophy.`,
  });
});

router.get("/contact", async (req, res) => {
  res.render("pages/contact", {
    canonicalUrl: baseUrl(req) + "/contact",
    siteUrl: baseUrl(req),
    pageTitle: `${res.locals.settings.businessName} | Contact`,
    pageDescription: `Get in touch with ${res.locals.settings.businessName}.`,
  });
});

router.get("/services", async (req, res) => {
  const services = await Service.find({ published: true }).sort({ order: 1, createdAt: 1 });
  res.render("pages/services", {
    services,
    canonicalUrl: baseUrl(req) + "/services",
    pageTitle: `${res.locals.settings.businessName} | Services`,
    pageDescription: "Our services — interiors, civil construction, renovation, turnkey projects and more.",
  });
});

router.get("/services/:slug", async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, published: true });
  if (!service) return res.status(404).send("Service not found");
  res.render("pages/service-detail", {
    service,
    canonicalUrl: baseUrl(req) + "/services/" + service.slug,
    pageTitle: `${res.locals.settings.businessName} | ${service.title}`,
    pageDescription: service.shortDescription || res.locals.settings.seoDescription,
  });
});

router.get("/portfolio", async (req, res) => {
  const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 });
  res.render("pages/portfolio", {
    projects,
    canonicalUrl: baseUrl(req) + "/portfolio",
    pageTitle: `${res.locals.settings.businessName} | Portfolio`,
    pageDescription: "Explore selected interior design and civil engineering projects.",
  });
});

router.get("/gallery", async (req, res) => {
  const items = await GalleryItem.find({ published: true }).sort({ order: 1, createdAt: 1 });
  const galleryImages = items.length ? items.map((i) => i.image) : [];
  res.render("pages/gallery", {
    galleryImages,
    canonicalUrl: baseUrl(req) + "/gallery",
    pageTitle: `${res.locals.settings.businessName} | Gallery`,
    pageDescription: "A curated visual gallery of interiors and spaces.",
  });
});

router.get("/cost-calculator", async (req, res) => {
  res.render("pages/cost-calculator", {
    canonicalUrl: baseUrl(req) + "/cost-calculator",
    pageTitle: `${res.locals.settings.businessName} | Cost Calculator`,
    pageDescription: "Get an instant, tentative estimate for your flat interior.",
  });
});

// ---------- LEAD CAPTURE (Contact form + Cost Calculator) ----------
router.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, error: "Name and phone are required" });
  await Enquiry.create({ source: "contact", name, email, phone, message });
  res.json({ ok: true });
});

router.post("/api/cost-calculator", async (req, res) => {
  const { name, phone, city, pincode, area, bhk, package: pkg, estimatedTotal } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, error: "Name and phone are required" });
  await Enquiry.create({ source: "cost-calculator", name, phone, city, pincode, area, bhk, package: pkg, estimatedTotal });
  res.json({ ok: true });
});

module.exports = router;
