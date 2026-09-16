const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const ExcelJS = require("exceljs");

const Admin = require("../models/Admin");
const Settings = require("../models/Settings");
const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");
const TeamMember = require("../models/TeamMember");
const Project = require("../models/Project");
const GalleryItem = require("../models/GalleryItem");
const Enquiry = require("../models/Enquiry");

const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// ---------- AUTH ----------
router.get("/login", (req, res) => {
  if (req.session.adminId) return res.redirect("/admin");
  res.render("admin/login", { layoutTitle: "Admin Login" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ $or: [{ username }, { email: username }] });
  if (!admin || !(await admin.checkPassword(password))) {
    req.flash("error", "Invalid username or password");
    return res.redirect("/admin/login");
  }
  req.session.adminId = admin._id.toString();
  res.redirect("/admin");
});

router.post("/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.use(requireAdmin);

// ---------- DASHBOARD ----------
router.get("/", async (req, res) => {
  const [
    servicesCount,
    testimonialsCount,
    teamCount,
    projectsCount,
    galleryCount,
    enquiriesCount,
    unreadEnquiriesCount,
    recentEnquiries,
    draftServicesCount,
  ] = await Promise.all([
    Service.countDocuments(),
    Testimonial.countDocuments(),
    TeamMember.countDocuments(),
    Project.countDocuments(),
    GalleryItem.countDocuments(),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ read: false }),
    Enquiry.find().sort({ createdAt: -1 }).limit(6),
    Service.countDocuments({ published: false }),
  ]);
  res.render("admin/dashboard", {
    layoutTitle: "Dashboard",
    counts: { servicesCount, testimonialsCount, teamCount, projectsCount, galleryCount, enquiriesCount, unreadEnquiriesCount, draftServicesCount },
    recentEnquiries,
  });
});

// ---------- ENQUIRIES ----------
router.get("/enquiries", async (req, res) => {
  const filter = req.query.source ? { source: req.query.source } : {};
  const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
  res.render("admin/enquiries/list", { layoutTitle: "Enquiries", enquiries, activeSource: req.query.source || "" });
});

router.post("/enquiries/:id/read", async (req, res) => {
  await Enquiry.findByIdAndUpdate(req.params.id, { read: true });
  res.redirect("/admin/enquiries");
});

router.post("/enquiries/:id/delete", async (req, res) => {
  await Enquiry.findByIdAndDelete(req.params.id);
  req.flash("success", "Enquiry deleted");
  res.redirect("/admin/enquiries");
});

router.get("/enquiries/export.xlsx", async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Enquiries");
  sheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Source", key: "source", width: 16 },
    { header: "Name", key: "name", width: 22 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 24 },
    { header: "City", key: "city", width: 16 },
    { header: "Pincode", key: "pincode", width: 12 },
    { header: "Area", key: "area", width: 12 },
    { header: "BHK", key: "bhk", width: 10 },
    { header: "Package", key: "package", width: 12 },
    { header: "Estimated Total", key: "estimatedTotal", width: 16 },
    { header: "Message", key: "message", width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };

  enquiries.forEach((e) => {
    sheet.addRow({
      date: e.createdAt.toLocaleString("en-IN"),
      source: e.source,
      name: e.name,
      phone: e.phone,
      email: e.email,
      city: e.city,
      pincode: e.pincode,
      area: e.area,
      bhk: e.bhk,
      package: e.package,
      estimatedTotal: e.estimatedTotal,
      message: e.message,
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="enquiries-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

// ---------- SETTINGS ----------
router.get("/settings", async (req, res) => {
  const settings = await Settings.getSingleton();
  res.render("admin/settings", { layoutTitle: "Website Settings", settings });
});

router.post("/settings", upload.single("heroImageFile"), async (req, res) => {
  const settings = await Settings.getSingleton();
  const b = req.body;
  Object.assign(settings, {
    businessName: b.businessName,
    email: b.email,
    phone: b.phone,
    whatsapp: b.whatsapp,
    address: b.address,
    social: {
      instagram: b.instagram,
      facebook: b.facebook,
      linkedin: b.linkedin,
    },
    heroTitle: b.heroTitle,
    heroDescription: b.heroDescription,
    heroStudioLocation: b.heroStudioLocation,
    heroEstSince: b.heroEstSince,
    heroSpeciality: b.heroSpeciality,
    heroRating: b.heroRating,
    aboutTagline: b.aboutTagline,
    aboutContent: b.aboutContent,
    ctaTitle: b.ctaTitle,
    ctaDescription: b.ctaDescription,
    ctaButtonText: b.ctaButtonText,
    ctaButtonLink: b.ctaButtonLink,
    footerAbout: b.footerAbout,
    footerCopyright: b.footerCopyright,
    seoTitle: b.seoTitle,
    seoDescription: b.seoDescription,
  });
  if (req.file) settings.heroImage = "/uploads/" + req.file.filename;
  else if (b.heroImage) settings.heroImage = b.heroImage;
  await settings.save();
  req.flash("success", "Settings updated");
  res.redirect("/admin/settings");
});

// ---------- Generic reorder helper ----------
function makeReorderRoute(Model) {
  return async (req, res) => {
    const { ids } = req.body; // array of ids in new order
    if (Array.isArray(ids)) {
      await Promise.all(ids.map((id, idx) => Model.updateOne({ _id: id }, { order: idx })));
    }
    res.json({ ok: true });
  };
}

// ---------- SERVICES ----------
router.get("/services", async (req, res) => {
  const services = await Service.find().sort({ order: 1, createdAt: 1 });
  res.render("admin/services/list", { layoutTitle: "Services", services });
});

router.get("/services/new", (req, res) => {
  res.render("admin/services/form", { layoutTitle: "New Service", service: null });
});

router.post("/services", upload.single("imageFile"), async (req, res) => {
  const b = req.body;
  const benefits = (b.benefits || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const faqs = (b.faqs || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, ...rest] = line.split("::");
      return { question: (q || "").trim(), answer: rest.join("::").trim() };
    })
    .filter((f) => f.question && f.answer);

  const slug = slugify(b.slug || b.title, { lower: true, strict: true });
  const image = req.file ? "/uploads/" + req.file.filename : b.image || "";

  await Service.create({
    title: b.title,
    slug,
    category: b.category,
    image,
    shortDescription: b.shortDescription,
    content: b.content,
    benefits,
    faqs,
    order: Number(b.order) || 0,
    published: b.published === "on",
  });
  req.flash("success", "Service created");
  res.redirect("/admin/services");
});

router.get("/services/:id/edit", async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).send("Not found");
  res.render("admin/services/form", { layoutTitle: "Edit Service", service });
});

router.post("/services/:id", upload.single("imageFile"), async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).send("Not found");
  const b = req.body;
  const benefits = (b.benefits || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const faqs = (b.faqs || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, ...rest] = line.split("::");
      return { question: (q || "").trim(), answer: rest.join("::").trim() };
    })
    .filter((f) => f.question && f.answer);

  service.title = b.title;
  service.slug = slugify(b.slug || b.title, { lower: true, strict: true });
  service.category = b.category;
  service.shortDescription = b.shortDescription;
  service.content = b.content;
  service.benefits = benefits;
  service.faqs = faqs;
  service.order = Number(b.order) || 0;
  service.published = b.published === "on";
  if (req.file) service.image = "/uploads/" + req.file.filename;
  else if (b.image) service.image = b.image;

  await service.save();
  req.flash("success", "Service updated");
  res.redirect("/admin/services");
});

router.post("/services/:id/delete", async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  req.flash("success", "Service deleted");
  res.redirect("/admin/services");
});

router.post("/services/reorder", makeReorderRoute(Service));

// ---------- TESTIMONIALS ----------
router.get("/testimonials", async (req, res) => {
  const testimonials = await Testimonial.find().sort({ order: 1, createdAt: 1 });
  res.render("admin/testimonials/list", { layoutTitle: "Testimonials", testimonials });
});

router.get("/testimonials/new", (req, res) => {
  res.render("admin/testimonials/form", { layoutTitle: "New Testimonial", testimonial: null });
});

router.post("/testimonials", upload.single("imageFile"), async (req, res) => {
  const b = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : b.image || "";
  await Testimonial.create({
    name: b.name,
    role: b.role,
    quote: b.quote,
    image,
    order: Number(b.order) || 0,
    published: b.published === "on",
  });
  req.flash("success", "Testimonial created");
  res.redirect("/admin/testimonials");
});

router.get("/testimonials/:id/edit", async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).send("Not found");
  res.render("admin/testimonials/form", { layoutTitle: "Edit Testimonial", testimonial });
});

router.post("/testimonials/:id", upload.single("imageFile"), async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).send("Not found");
  const b = req.body;
  testimonial.name = b.name;
  testimonial.role = b.role;
  testimonial.quote = b.quote;
  testimonial.order = Number(b.order) || 0;
  testimonial.published = b.published === "on";
  if (req.file) testimonial.image = "/uploads/" + req.file.filename;
  else if (b.image) testimonial.image = b.image;
  await testimonial.save();
  req.flash("success", "Testimonial updated");
  res.redirect("/admin/testimonials");
});

router.post("/testimonials/:id/delete", async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  req.flash("success", "Testimonial deleted");
  res.redirect("/admin/testimonials");
});

router.post("/testimonials/reorder", makeReorderRoute(Testimonial));

// ---------- TEAM ----------
router.get("/team", async (req, res) => {
  const team = await TeamMember.find().sort({ order: 1, createdAt: 1 });
  res.render("admin/team/list", { layoutTitle: "Team", team });
});

router.get("/team/new", (req, res) => {
  res.render("admin/team/form", { layoutTitle: "New Team Member", member: null });
});

router.post("/team", upload.single("imageFile"), async (req, res) => {
  const b = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : b.image || "";
  await TeamMember.create({
    name: b.name,
    role: b.role,
    image,
    order: Number(b.order) || 0,
    published: b.published === "on",
  });
  req.flash("success", "Team member added");
  res.redirect("/admin/team");
});

router.get("/team/:id/edit", async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) return res.status(404).send("Not found");
  res.render("admin/team/form", { layoutTitle: "Edit Team Member", member });
});

router.post("/team/:id", upload.single("imageFile"), async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) return res.status(404).send("Not found");
  const b = req.body;
  member.name = b.name;
  member.role = b.role;
  member.order = Number(b.order) || 0;
  member.published = b.published === "on";
  if (req.file) member.image = "/uploads/" + req.file.filename;
  else if (b.image) member.image = b.image;
  await member.save();
  req.flash("success", "Team member updated");
  res.redirect("/admin/team");
});

router.post("/team/:id/delete", async (req, res) => {
  await TeamMember.findByIdAndDelete(req.params.id);
  req.flash("success", "Team member removed");
  res.redirect("/admin/team");
});

router.post("/team/reorder", makeReorderRoute(TeamMember));

// ---------- PROJECTS (Portfolio) ----------
router.get("/projects", async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 });
  res.render("admin/projects/list", { layoutTitle: "Portfolio Projects", projects });
});

router.get("/projects/new", (req, res) => {
  res.render("admin/projects/form", { layoutTitle: "New Project", project: null });
});

router.post("/projects", upload.single("imageFile"), async (req, res) => {
  const b = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : b.image || "";
  await Project.create({
    title: b.title,
    category: b.category,
    image,
    order: Number(b.order) || 0,
    published: b.published === "on",
  });
  req.flash("success", "Project created");
  res.redirect("/admin/projects");
});

router.get("/projects/:id/edit", async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send("Not found");
  res.render("admin/projects/form", { layoutTitle: "Edit Project", project });
});

router.post("/projects/:id", upload.single("imageFile"), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send("Not found");
  const b = req.body;
  project.title = b.title;
  project.category = b.category;
  project.order = Number(b.order) || 0;
  project.published = b.published === "on";
  if (req.file) project.image = "/uploads/" + req.file.filename;
  else if (b.image) project.image = b.image;
  await project.save();
  req.flash("success", "Project updated");
  res.redirect("/admin/projects");
});

router.post("/projects/:id/delete", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  req.flash("success", "Project deleted");
  res.redirect("/admin/projects");
});

router.post("/projects/reorder", makeReorderRoute(Project));

// ---------- GALLERY ----------
router.get("/gallery", async (req, res) => {
  const items = await GalleryItem.find().sort({ order: 1, createdAt: 1 });
  res.render("admin/gallery/list", { layoutTitle: "Gallery", items });
});

router.get("/gallery/new", (req, res) => {
  res.render("admin/gallery/form", { layoutTitle: "New Gallery Image", item: null });
});

router.post("/gallery", upload.single("imageFile"), async (req, res) => {
  const b = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : b.image || "";
  if (!image) {
    req.flash("error", "Please provide an image");
    return res.redirect("/admin/gallery/new");
  }
  await GalleryItem.create({
    image,
    caption: b.caption,
    order: Number(b.order) || 0,
    published: b.published === "on",
  });
  req.flash("success", "Gallery image added");
  res.redirect("/admin/gallery");
});

router.get("/gallery/:id/edit", async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) return res.status(404).send("Not found");
  res.render("admin/gallery/form", { layoutTitle: "Edit Gallery Image", item });
});

router.post("/gallery/:id", upload.single("imageFile"), async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) return res.status(404).send("Not found");
  const b = req.body;
  item.caption = b.caption;
  item.order = Number(b.order) || 0;
  item.published = b.published === "on";
  if (req.file) item.image = "/uploads/" + req.file.filename;
  else if (b.image) item.image = b.image;
  await item.save();
  req.flash("success", "Gallery image updated");
  res.redirect("/admin/gallery");
});

router.post("/gallery/:id/delete", async (req, res) => {
  await GalleryItem.findByIdAndDelete(req.params.id);
  req.flash("success", "Gallery image deleted");
  res.redirect("/admin/gallery");
});

router.post("/gallery/reorder", makeReorderRoute(GalleryItem));

module.exports = router;
