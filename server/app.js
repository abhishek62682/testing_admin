require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const connectDB = require("./config/db");
const Settings = require("./models/Settings");
const Service = require("./models/Service");
const Enquiry = require("./models/Enquiry");

const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);
app.use(flash());

app.use(async (req, res, next) => {
  try {
    res.locals.settings = await Settings.getSingleton();
    res.locals.footerServices = await Service.find({ published: true }).sort({ order: 1, createdAt: 1 }).limit(4);
    res.locals.isAdmin = !!(req.session && req.session.adminId);
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.unreadEnquiriesCount = res.locals.isAdmin ? await Enquiry.countDocuments({ read: false }) : 0;
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/admin", adminRoutes);
app.use("/", publicRoutes);

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong: " + err.message);
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
