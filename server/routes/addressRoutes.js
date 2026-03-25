const express = require("express");
const router = express.Router();
const { searchAddress } = require("../controllers/addressController");

router.get("/search", searchAddress);

module.exports = router;
