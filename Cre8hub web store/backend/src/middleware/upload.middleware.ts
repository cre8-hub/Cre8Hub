import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

// ── Ensure upload directories exist ─────────────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const IMAGES_DIR = path.join(UPLOADS_DIR, "images");
const FILES_DIR = path.join(UPLOADS_DIR, "files");

[UPLOADS_DIR, IMAGES_DIR, FILES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Image upload (product thumbnails) ───────────────────────────────────────
const imageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuid()}${ext}`);
    },
});

export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        cb(null, allowed.includes(file.mimetype));
    },
}).single("file");

// ── Digital product file upload (any file type) ──────────────────────────────
const fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, FILES_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuid()}${ext}`);
    },
});

export const uploadFile = multer({
    storage: fileStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
}).single("file");
