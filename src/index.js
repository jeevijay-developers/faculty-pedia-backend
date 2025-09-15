require("dotenv").config();
const express = require("express");
const APP = express();
const cors = require("cors");
const AUTH_ROUTES = require("./routes/auth.routes");
const FOLLOW_ROUTES = require("./routes/follow.routes");
const EDUCATOR_ROUTES = require("./routes/educator.routes");
const WEBINARS_ROUTES = require("./routes/webinar.routes");
const BLOG_ROUTES = require("./routes/blog.routes");
const COURSE_ROUTES = require("./routes/liveCourse.routes");
const STUDENT_UPDATE_ROUTES = require("./routes/studentUpdate.routes");
const QUESTIONS_ROUTES = require("./routes/LiveTest/question.route");
const LIVE_TEST_ROUTES = require("./routes/LiveTest/live-test.route");
const TEST_SERIES_ROUTES = require("./routes/LiveTest/live-test-series.route");
const PAY_PER_HOUR_ROUTES = require("./routes/one-onePPH.route");
const TEST_ROUTES = require("./routes/LiveTest/live-test.route");
const RESULT_ROUTES = require("./routes/result.routes");
// Student related (courses, results, following)
const STUDENT_ROUTES = require("./routes/student.routes");

const { connectDB } = require("./helpers/connectDB");
require("dotenv").config();
// const
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://faculty-pedia-frontend.vercel.app",
  "ADMIN_ORIGIN",
  "TEST_ORIGIN",
];
// CORS MANAGE random
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
APP.use("/api/follow", FOLLOW_ROUTES);
APP.use("/api/course", COURSE_ROUTES);
APP.use("/api/educator", EDUCATOR_ROUTES);
APP.use("/api/webinars", WEBINARS_ROUTES);
APP.use("/api/blogs", BLOG_ROUTES);
APP.use("/api/update", STUDENT_UPDATE_ROUTES);
APP.use("/api/pay-per-hour", PAY_PER_HOUR_ROUTES);
APP.use("/api/results", RESULT_ROUTES);
APP.use("/api/questions", QUESTIONS_ROUTES);
APP.use("/api/live-test", LIVE_TEST_ROUTES);
APP.use("/api/test-series", TEST_SERIES_ROUTES);
APP.use("/api/test", TEST_ROUTES);
APP.use("/api/students", STUDENT_ROUTES);
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
