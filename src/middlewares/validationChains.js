const { body, param } = require("express-validator");

const emailChain = () => body("email").trim().notEmpty().isEmail();
// const nameChain = () => body("name").trim().notEmpty().isLength({ min: 3, max: 30 });
const mobileChain = () =>
  body("mobileNumber").trim().notEmpty().isMobilePhone();
const nameChain = () =>
  body("name")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 30 })
    .withMessage("Name must be between 3 to 30 characters");
const passwordChain = () =>
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long");

const stringChain = (fieldName, minLength = 1, maxLength = 100) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(
      `${fieldName} must be between ${minLength} to ${maxLength} characters`
    );
};

const arrayFieldChain = (
  fieldName,
  property,
  minLength = 1,
  maxLength = 100
) => {
  return body(`${fieldName}.*.${property}`)
    .trim()
    .notEmpty()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(
      `${property} in ${fieldName} must be between ${minLength} to ${maxLength} characters`
    );
};

const arrayEnumChain = (fieldName, property, allowedValues) => {
  return body(`${fieldName}.*.${property}`)
    .trim()
    .notEmpty()
    .isIn(allowedValues)
    .withMessage(
      `${property} in ${fieldName} must be one of the following values: ${allowedValues.join(
        ", "
      )}`
    );
};

const dateFieldChain = (fieldName) => {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date (ISO8601 format)`)
    .toDate(); // convert to JS Date object if valid
};

const numberChain = (fieldName, min = 0) => {
  return body(fieldName)
    .notEmpty()
    .isNumeric({ min })
    .withMessage(
      `${fieldName} must be a valid number greater than or equal to ${min}`
    );
};

const enumChain = (fieldName, allowedValues) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .isIn(allowedValues)
    .withMessage(
      `${fieldName} must be one of the following values: ${allowedValues.join(
        ", "
      )}`
    );
};

const mongoIDChainBody = (fieldName) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .isMongoId()
    .withMessage(`${fieldName} must be a valid MongoDB ObjectId`);
};
const mongoIDChainParams = (fieldName) => {
  return param(fieldName)
    .trim()
    .notEmpty()
    .isMongoId()
    .withMessage(`${fieldName} must be a valid MongoDB ObjectId`);
};

const simpleArrayChain = (fieldName) => {
  return body(`${fieldName}.*`)
    .trim()
    .notEmpty()
    .withMessage(`Each item in ${fieldName} must be a non-empty string`);
};

const mongoIdChainInReqParams = (paramName) => {
  return param(paramName)
    .trim()
    .notEmpty()
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`);
};

module.exports = {
  emailChain,
  mobileChain,
  nameChain,
  passwordChain,
  stringChain,
  arrayFieldChain,
  dateFieldChain,
  numberChain,
  enumChain,
  arrayEnumChain,
  mongoIDChainBody,
  mongoIDChainParams,
  simpleArrayChain,
  mongoIdChainInReqParams,
};
