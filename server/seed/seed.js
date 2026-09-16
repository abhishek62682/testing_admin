require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Settings = require("../models/Settings");
const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");
const TeamMember = require("../models/TeamMember");
const Project = require("../models/Project");
const GalleryItem = require("../models/GalleryItem");

const services = [
  { title: "Residential Interior Design", slug: "residential-interior-design", category: "Interiors", image: "https://framerusercontent.com/images/T6geNXuDqq1KVexrgVr7YFywx4.png?scale-down-to=1024&width=1200&height=802", shortDescription: "Thoughtfully designed homes that balance beauty with everyday function.", content: "We design residential interiors from concept to completion — space planning, material selection, and styling tailored to how you live.", benefits: ["Personalized design concepts", "End-to-end project management", "Quality material sourcing"], faqs: [{ question: "How long does a typical home take?", answer: "Most residential projects take 8-14 weeks depending on scope." }], order: 0 },
  { title: "Commercial & Office Interiors", slug: "commercial-office-interiors", category: "Interiors", image: "https://framerusercontent.com/images/s2qN6O29ysWc0QRn7Kdicvodk.png?scale-down-to=1024&width=800&height=1200", shortDescription: "Functional, brand-aligned workspaces designed for productivity.", content: "From offices to retail spaces, we create commercial interiors that reflect your brand and support your team.", benefits: ["Space optimization", "Brand-aligned design", "Minimal business disruption"], faqs: [], order: 1 },
  { title: "Civil Construction & Structural Work", slug: "civil-construction-structural-work", category: "Construction", image: "https://framerusercontent.com/images/h87knZPq10A9fQf0b5LZXH7Rvw.png?scale-down-to=1024&width=1200&height=1200", shortDescription: "Solid structural foundations built with precision engineering.", content: "Our civil engineering team handles structural work, additions, and construction with a focus on safety and durability.", benefits: ["Licensed structural engineers", "Quality material standards", "On-time execution"], faqs: [], order: 2 },
  { title: "Renovation & Remodeling", slug: "renovation-remodeling", category: "Renovation", image: "https://framerusercontent.com/images/oairuUrhUpnUEwoYnA5D25TiEeI.png?width=1200&height=800", shortDescription: "Breathing new life into existing spaces.", content: "We renovate and remodel homes and offices, upgrading layouts, finishes, and systems with minimal disruption.", benefits: ["Phased renovation options", "Modernized layouts", "Budget-conscious planning"], faqs: [], order: 3 },
  { title: "Turnkey Interior Projects", slug: "turnkey-interior-projects", category: "Turnkey", image: "https://framerusercontent.com/images/pqToNmi7VChoDbXOOdp4whAjGz4.png?scale-down-to=1024&width=1200&height=600", shortDescription: "One team, one timeline — design to move-in ready.", content: "A single point of accountability from design through execution, so you get a move-in ready space without managing multiple vendors.", benefits: ["Single point of contact", "Fixed timelines", "Transparent pricing"], faqs: [], order: 4 },
  { title: "Landscape Architecture", slug: "landscape-architecture", category: "Landscape", image: "https://framerusercontent.com/images/92QXDUHTXvpknuenDhJMWw8R40.png?scale-down-to=1024&width=1200&height=673", shortDescription: "Outdoor spaces designed with the same care as interiors.", content: "We design gardens, terraces, and outdoor living areas that extend your home's design language outward.", benefits: ["Sustainable planting design", "Custom hardscaping", "Seamless indoor-outdoor flow"], faqs: [], order: 5 },
  { title: "In-house CNC Router & CO₂ Laser", slug: "in-house-cnc-router-co2-laser", category: "Fabrication", image: "https://framerusercontent.com/images/OxrwN4foa5ceufLjznXGuVD1sk.png?width=1199&height=903", shortDescription: "Bespoke fabrication produced in-house for precision and speed.", content: "Our in-house CNC and laser fabrication lets us produce custom furniture and decor elements with tight tolerances and fast turnarounds.", benefits: ["Custom furniture fabrication", "Faster turnarounds", "Precision cutting & engraving"], faqs: [], order: 6 },
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

const galleryImages = [
  "https://framerusercontent.com/images/IaVcYeEdcZnfOMACnHKhRG2eA.jpg?width=1200&height=900",
  "https://framerusercontent.com/images/5cee2EXdbBi2Qd6r09KHa7ZJXw.jpg?width=1000&height=1000",
  "https://framerusercontent.com/images/O64BvWg7qKxhwTsoaMwOogOpIws.png?scale-down-to=1024&width=1200&height=1200",
  "https://framerusercontent.com/images/2fWepbEq4iRUJ6C2yZ31VIckXc4.png?scale-down-to=1024&width=800&height=1200",
  "https://framerusercontent.com/images/C1JRgFChrNMq7qX0hGThqIhtS4.png?scale-down-to=1024&width=904&height=1200",
  "https://framerusercontent.com/images/92QXDUHTXvpknuenDhJMWw8R40.png?scale-down-to=1024&width=1200&height=673",
  "https://framerusercontent.com/images/VC4qwfmfo0MFJmeX4tEZEVbnjn8.png?width=1200&height=800",
  "https://framerusercontent.com/images/T6geNXuDqq1KVexrgVr7YFywx4.png?scale-down-to=1024&width=1200&height=802",
  "https://framerusercontent.com/images/s2qN6O29ysWc0QRn7Kdicvodk.png?scale-down-to=1024&width=800&height=1200",
  "https://framerusercontent.com/images/h87knZPq10A9fQf0b5LZXH7Rvw.png?scale-down-to=1024&width=1200&height=1200",
  "https://framerusercontent.com/images/oairuUrhUpnUEwoYnA5D25TiEeI.png?width=1200&height=800",
  "https://framerusercontent.com/images/pqToNmi7VChoDbXOOdp4whAjGz4.png?scale-down-to=1024&width=1200&height=600",
  "https://framerusercontent.com/images/aDtGubgGAeXhajjsmNZuK79LE.png?scale-down-to=1024&width=1200&height=686",
  "https://framerusercontent.com/images/KISQbq1TEZFjuJMfZ0Gb7hTXoI.png?scale-down-to=1024&width=1200&height=1200",
  "https://framerusercontent.com/images/OxrwN4foa5ceufLjznXGuVD1sk.png?width=1199&height=903",
  "https://framerusercontent.com/images/B4wRK0oEiOLQhDFFqz0BnjXo1E.png?width=906&height=1200",
  "https://framerusercontent.com/images/KnsCNi9u61AcCGrxlpzTM5amLsw.png?width=903&height=665",
  "https://framerusercontent.com/images/Y2Yp18uPF5BVQ1kFtuBU46jol74.png?width=1200&height=1200",
];

async function seed() {
  await connectDB();

  await Settings.getSingleton();

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(services);
    console.log(`Seeded ${services.length} services`);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany(projects);
    console.log(`Seeded ${projects.length} projects`);
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany(testimonials);
    console.log(`Seeded ${testimonials.length} testimonials`);
  }

  const teamCount = await TeamMember.countDocuments();
  if (teamCount === 0) {
    await TeamMember.insertMany(team);
    console.log(`Seeded ${team.length} team members`);
  }

  const galleryCount = await GalleryItem.countDocuments();
  if (galleryCount === 0) {
    await GalleryItem.insertMany(galleryImages.map((image, i) => ({ image, order: i })));
    console.log(`Seeded ${galleryImages.length} gallery images`);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
