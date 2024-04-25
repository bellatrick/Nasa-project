const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanets = (await getAllPlanets()).length;
        console.log(`${countPlanets} habitable planets found`);
        resolve();
      });
  });
}
async function getAllPlanets() {
  return await planets.find({});
}
async function savePlanet(data) {
  try {
    await planets.updateOne(
      { kepler_name: data.kepler_name },
      { kepler_name: data.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.error(error, " Could not save planet");
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
