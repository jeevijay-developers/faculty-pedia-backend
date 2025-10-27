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
const SUBSCRIBE_ROUTES = require("./routes/SubsRoute/Subs.route");
const STUDENT_ROUTES = require("./routes/student.routes");
const UPDATE_EDUCATOR_ROUTES = require("./routes/educatorUpdate.routes");
const IMAGE_ROUTES = require("./routes/images.routes");
const PAYMENT_ROUTES = require("./routes/payment.routes");

const { connectDB } = require("./helpers/connectDB");
require("dotenv").config();
// const
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_DASHBOARD_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL,
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
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

APP.options(/.*/, cors(corsOptions));

APP.use(cors(corsOptions));
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use("/api/auth", AUTH_ROUTES);
APP.use("/api/follow", FOLLOW_ROUTES);
APP.use("/api/course", COURSE_ROUTES);
APP.use("/api/educator", EDUCATOR_ROUTES);
APP.use("/api/educator-update", UPDATE_EDUCATOR_ROUTES);
APP.use("/api/webinars", WEBINARS_ROUTES);
APP.use("/api/blogs", BLOG_ROUTES);
APP.use("/api/update", STUDENT_UPDATE_ROUTES);
APP.use("/api/pay-per-hour", PAY_PER_HOUR_ROUTES);
APP.use("/api/results", RESULT_ROUTES);
APP.use("/api/questions", QUESTIONS_ROUTES);
APP.use("/api/live-test", LIVE_TEST_ROUTES);
APP.use("/api/subscribe", SUBSCRIBE_ROUTES);
APP.use("/api/test-series", TEST_SERIES_ROUTES);
APP.use("/api/test", TEST_ROUTES);
APP.use("/api/students", STUDENT_ROUTES);
APP.use("/api/images", IMAGE_ROUTES);
APP.use("/api/payment", PAYMENT_ROUTES);
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
