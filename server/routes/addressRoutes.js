const express = require("express");
const router = express.Router();
const { searchAddress } = require("../controllers/addressController");

// =========================
// ADDRESS ROUTES
// =========================
router.get("/search", searchAddress);

module.exports = router;