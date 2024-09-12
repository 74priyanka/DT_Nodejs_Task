const express = require("express");
const connectDB = require("./db");
const eventRoutes = require("./routes/events");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("api is working");
});

const PORT = 3002;

connectDB()
  .then((db) => {
    app.use(
      "/api/v3/app",
      (req, res, next) => {
        req.db = db;
        next();
      },
      eventRoutes
    );
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit if unable to connect to MongoDB
  });
