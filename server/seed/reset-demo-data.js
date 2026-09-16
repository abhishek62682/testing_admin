require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Settings = require("../models/Settings");
const Testimonial = require("../models/Testimonial");
const TeamMember = require("../models/TeamMember");
const Project = require("../models/Project");

const testimonials = [
  { name: "Test Client One", role: "Sample Clinic Pvt Ltd", quote: "This is placeholder testimonial text used for demo purposes. It shows how a client quote will appear on the live site once you add real testimonials from the admin panel.", image: "/assets/img/testimonials/client-01.jpg", order: 0 },
  { name: "Test Client Two", role: "Sample Residency", quote: "This is placeholder testimonial text used for demo purposes. Replace this with a genuine client review from the Testimonials section in the admin panel.", image: "/assets/img/testimonials/client-02.jpg", order: 1 },
  { name: "Test Client Three", role: "Sample Apartments", quote: "This is placeholder testimonial text used for demo purposes. Edit or delete this entry and add your own from the admin panel.", image: "/assets/img/testimonials/client-03.jpg", order: 2 },
];

const team = [
  { name: "Test Member One", role: "Managing Partner", image: "https://framerusercontent.com/images/nNK7Gw1ycxUucx9Oz8LOVmTdafU.png?scale-down-to=1024&width=900&height=1200", order: 0 },
  { name: "Test Member Two", role: "Senior Interior Designer", image: "https://framerusercontent.com/images/aGaGiFVVmmuPDWPQax5Nqsa6sxU.png?scale-down-to=1024&width=800&height=1200", order: 1 },
  { name: "Test Member Three", role: "Civil Engineer", image: "https://framerusercontent.com/images/sU24OqYUdpw1XvluTke1268bw.png?scale-down-to=1024&width=904&height=1200", order: 2 },
];

const projects = [
  { title: "Sample Residence 1", category: "Residential Interior Design", image: "https://framerusercontent.com/images/aDtGubgGAeXhajjsmNZuK79LE.png?scale-down-to=1024&width=1200&height=686", order: 0 },
  { title: "Sample Apartment 1", category: "Residential Interior Design", image: "https://framerusercontent.com/images/pqToNmi7VChoDbXOOdp4whAjGz4.png?scale-down-to=1024&width=1200&height=600", order: 1 },
  { title: "Sample Penthouse", category: "Turnkey Interior Project", image: "https://framerusercontent.com/images/oairuUrhUpnUEwoYnA5D25TiEeI.png?width=1200&height=800", order: 2 },
  { title: "Sample Corporate Office", category: "Commercial & Office Interiors", image: "https://framerusercontent.com/images/T6geNXuDqq1KVexrgVr7YFywx4.png?scale-down-to=1024&width=1200&height=802", order: 3 },
  { title: "Sample Retail Store", category: "Commercial & Office Interiors", image: "https://framerusercontent.com/images/s2qN6O29ysWc0QRn7Kdicvodk.png?scale-down-to=1024&width=800&height=1200", order: 4 },
  { title: "Sample Villa", category: "Civil Construction & Structural Work", image: "https://framerusercontent.com/images/h87knZPq10A9fQf0b5LZXH7Rvw.png?scale-down-to=1024&width=1200&height=1200", order: 5 },
  { title: "Sample Clinic", category: "Commercial & Office Interiors", image: "https://framerusercontent.com/images/KISQbq1TEZFjuJMfZ0Gb7hTXoI.png?scale-down-to=1024&width=1200&height=1200", order: 6 },
  { title: "Sample Duplex Renovation", category: "Renovation & Remodeling", image: "https://framerusercontent.com/images/OxrwN4foa5ceufLjznXGuVD1sk.png?width=1199&height=903", order: 7 },
  { title: "Sample Apartment 2", category: "Residential Interior Design", image: "https://framerusercontent.com/images/B4wRK0oEiOLQhDFFqz0BnjXo1E.png?width=906&height=1200", order: 8 },
];

async function main() {
  await connectDB();

  const settings = await Settings.getSingleton();
  settings.heroStudioLocation = "Test Studio, Test City";
  await settings.save();

  await Testimonial.deleteMany({});
  await Testimonial.insertMany(testimonials);

  await TeamMember.deleteMany({});
  await TeamMember.insertMany(team);

  await Project.deleteMany({});
  await Project.insertMany(projects);

  console.log("Reset testimonials, team, projects and hero studio location to placeholder/demo data");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
