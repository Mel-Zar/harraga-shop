const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================
// CREATE UPLOADS FOLDER
// =========================
const uploadPath = path.join(
    __dirname,
    "../uploads"
);

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true,
    });
}

// =========================
// MULTER STORAGE
// =========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1e9
            ) +
            path.extname(
                file.originalname
            );

        cb(null, uniqueName);
    },
});

// =========================
// IMAGE FILTER
// =========================
const fileFilter = (
    req,
    file,
    cb
) => {
    if (
        file.mimetype.startsWith(
            "image/"
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only image files are allowed"
            ),
            false
        );
    }
};

// =========================
// MULTER CONFIG
// =========================
const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 4,
        fileSize:
            5 * 1024 * 1024, // 5MB
    },
});

module.exports = upload;