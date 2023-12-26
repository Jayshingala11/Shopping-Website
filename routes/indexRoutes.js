const express = require("express");

const authRoutes = require("./authRoutes");
const shotRoutes = require("./shopRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/", shotRoutes);

module.exports = router;