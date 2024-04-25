const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const planetRouter = require("./routes/planets/planets.router");
const lauchesRouter =require('./routes/launches/launches.router')

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("combined"));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "..", "client", "build")));

app.use("/planets",planetRouter);
app.use('/launches',lauchesRouter)

app.get("/*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "client", "build", "index.html")
  );
});

module.exports = app;
