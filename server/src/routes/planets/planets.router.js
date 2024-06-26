const express = require("express");

const { httpGetAllPlanets } = require("../planets/planets.controller");

const router = express.Router();

router.get("/", httpGetAllPlanets);

module.exports = router;
