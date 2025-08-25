require("dotenv").config();
const express = require("express");
const APP = express();
const cors = require("cors");
const AUTH_ROUTES = require("./routes/auth.routes");
const { connectDB } = require("./helpers/connectDB");
require("dotenv").config();
// const
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "PROD_ORIGIN",
  "ADMIN_ORIGIN",
  "TEST_ORIGIN",
];
// CORS MANAGE
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

APP.use(cors(corsOptions));
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use("/api/auth", AUTH_ROUTES);

//? env imports
const PORT = process.env.PORT;

APP.get("/", (req, res) => {
  res.send("Hello World!");
});

//^ Server starting
APP.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  connectDB();
});
