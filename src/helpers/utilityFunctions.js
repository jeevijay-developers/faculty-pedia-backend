const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000);

exports.formatUserDate = (inputDate, outputFormat = "YYYY-MM-DD") => {
  const parsedDate = dayjs(inputDate);
  if (!parsedDate.isValid()) {
    return null;
  }
  return parsedDate.format(outputFormat);
};

/**
 * Parses any user-provided date string and returns
 * a JavaScript Date object set to T00:00:00Z (UTC).
 * Returns null if the input is invalid.
 */
exports.parseDate = (inputDate) => {
  const parsed = dayjs.utc(inputDate);
  return parsed.isValid() ? parsed.toDate() : null;
};

exports.parseDateRange = (inputDate) => {
  const parsed = dayjs.utc(inputDate);
  // console.log("PARSED DATE ", parsed);

  if (!parsed.isValid()) return null;

  return {
    startOfDay: parsed.startOf("day").toDate(),
    endOfDay: parsed.endOf("day").toDate(),
  };
};
