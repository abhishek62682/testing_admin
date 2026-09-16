const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

module.exports = upload;
