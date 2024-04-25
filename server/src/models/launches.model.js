const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

let DEFAULT_FLIGHT_NUMBER = 100;

async function getAllLaunches(skip, limit) {
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({
        flightNumber:-1
    })
    .skip(skip)
    .limit(limit);
}
async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({ kepler_name: launch.target });
  if (!planet) {
    throw new Error("No matching planet found ");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = {
    ...launch,
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  };
  await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchId(id) {
  return await findLaunch({ flightNumber: id });
}

async function abortLaunchById(id) {
  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.ok === 1 && aborted.nModified === 1;
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne({}).sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}


const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  }
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => payload.customers);
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers: customers,
    };
    saveLaunch(launch);
  }
  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }
}
module.exports = {
  launches,
  getAllLaunches,
  loadLaunchData,
  existsLaunchId,
  abortLaunchById,
  scheduleNewLaunch,
};
