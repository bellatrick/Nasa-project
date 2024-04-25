const http = require("http");
const mongoose = require("mongoose");
require("dotenv/config");
const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");
const {loadLaunchData}=require('./models/launches.model')

const server = http.createServer(app);
const MONGODB_URI = process.env.MONGODB_URI;

const PORT = process.env.PORT || 9000;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});
mongoose.connection.on("error", (err) => {
  console.error(err);
});
async function startServer() {
  await mongoose.connect(MONGODB_URI);
  await loadPlanetsData();
  await loadLaunchData()

  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

startServer();
