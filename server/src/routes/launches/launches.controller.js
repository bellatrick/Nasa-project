const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchId,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}
function validateRequestBody(body) {
  const errors = [];

  if (
    !body.mission ||
    typeof body.mission !== "string" ||
    body.mission.trim() === ""
  ) {
    errors.push("Invalid mission value.");
  }

  if (
    !body.rocket ||
    typeof body.rocket !== "string" ||
    body.rocket.trim() === ""
  ) {
    errors.push("Invalid rocket value.");
  }

  if (
    !body.target ||
    typeof body.target !== "string" ||
    body.target.trim() === ""
  ) {
    errors.push("Invalid target value.");
  }

  if (!body.launchDate || isNaN(Date.parse(body.launchDate))) {
    errors.push("Invalid launchDate value.");
  }

  if (errors.length > 0) {
    return errors;
  }

  return null;
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (validateRequestBody(launch)) {
    return res.status(400).json({ errors: validateRequestBody(launch) });
  }
  launch.launchDate = new Date(launch.launchDate);
  scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const id = Number(req.params.id);
  const existsLaunch = await existsLaunchId(id);
  if (!existsLaunch) {
    return res.status(404).json({ error: "Launch not found" });
  }
  const aborted = abortLaunchById(id);
  if (!aborted) {
    return res.status(400).json({ error: "Launch not aborted" });
  }
  return res.status(200).json({ ok: aborted });
}
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
