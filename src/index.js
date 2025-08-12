require("dotenv").config();
const express = require("express");
const APP = express();

//? env imports
const PORT = process.env.PORT;

APP.get("/", (req, res) => {
  res.send("Hello World!");
});

//^ Server starting
APP.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
