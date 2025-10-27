// Test Script for Payment System
// Run this after starting your server to verify everything is set up correctly

const VERIFY_PAYMENT_SETUP = {
  name: "Payment System Setup Verification",
  tests: [
    {
      name: "1. Environment Variables",
      check: () => {
        const required = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
          return {
            pass: false,
            message: `Missing environment variables: ${missing.join(", ")}`,
          };
        }

        return {
          pass: true,
          message: "All required environment variables are set",
        };
      },
    },
    {
      name: "2. Razorpay Package",
      check: () => {
        try {
          require("razorpay");
          return {
            pass: true,
            message: "Razorpay package is installed",
          };
        } catch (error) {
          return {
            pass: false,
            message:
              "Razorpay package not installed. Run: npm install razorpay",
          };
        }
      },
    },
    {
      name: "3. Payment Model",
      check: () => {
        try {
          const Payment = require("./src/models/Payment");
          return {
            pass: true,
            message: "Payment model loaded successfully",
          };
        } catch (error) {
          return {
            pass: false,
            message: `Payment model error: ${error.message}`,
          };
        }
      },
    },
    {
      name: "4. Payment Controller",
      check: () => {
        try {
          const controller = require("./src/controllers/PaymentController");
          const requiredMethods = [
            "createPaymentOrder",
            "verifyPayment",
            "handleWebhook",
            "getStudentPayments",
            "getEducatorPayments",
            "settlePayment",
          ];

          const missing = requiredMethods.filter(
            (method) => typeof controller[method] !== "function"
          );

          if (missing.length > 0) {
            return {
              pass: false,
              message: `Missing controller methods: ${missing.join(", ")}`,
            };
          }

          return {
            pass: true,
            message: "All payment controller methods are defined",
          };
        } catch (error) {
          return {
            pass: false,
            message: `Payment controller error: ${error.message}`,
          };
        }
      },
    },
    {
      name: "5. Payment Routes",
      check: () => {
        try {
          require("./src/routes/payment.routes");
          return {
            pass: true,
            message: "Payment routes loaded successfully",
          };
        } catch (error) {
          return {
            pass: false,
            message: `Payment routes error: ${error.message}`,
          };
        }
      },
    },
    {
      name: "6. Updated Educator Model",
      check: () => {
        try {
          const Educator = require("./src/models/Educator");
          const schema = Educator.schema.obj;

          if (!schema.revenue) {
            return {
              pass: false,
              message: "Educator model doesn't have revenue field",
            };
          }

          const revenueFields = Object.keys(schema.revenue);
          const required = [
            "bankDetails",
            "totalIncome",
            "lastMonthIncome",
            "totalAmountSettled",
            "totalPendingAmount",
          ];
          const missing = required.filter(
            (field) => !revenueFields.includes(field)
          );

          if (missing.length > 0) {
            return {
              pass: false,
              message: `Educator revenue missing fields: ${missing.join(", ")}`,
            };
          }

          return {
            pass: true,
            message: "Educator model has all required revenue fields",
          };
        } catch (error) {
          return {
            pass: false,
            message: `Educator model error: ${error.message}`,
          };
        }
      },
    },
    {
      name: "7. Updated Subscription Controllers",
      check: () => {
        try {
          const controller = require("./src/controllers/SubscriptionControllers/Subs.controller");

          // Check if Payment model is imported
          const content = require("fs").readFileSync(
            "./src/controllers/SubscriptionControllers/Subs.controller.js",
            "utf8"
          );

          if (!content.includes('require("../../models/Payment")')) {
            return {
              pass: false,
              message: "Subscription controller doesn't import Payment model",
            };
          }

          return {
            pass: true,
            message:
              "Subscription controllers updated with payment integration",
          };
        } catch (error) {
          return {
            pass: false,
            message: `Subscription controller error: ${error.message}`,
          };
        }
      },
    },
  ],
};

// Run verification
console.log("\n" + "=".repeat(60));
console.log("PAYMENT SYSTEM SETUP VERIFICATION");
console.log("=".repeat(60) + "\n");

require("dotenv").config();

let passCount = 0;
let failCount = 0;

VERIFY_PAYMENT_SETUP.tests.forEach((test) => {
  const result = test.check();
  const status = result.pass ? "✓ PASS" : "✗ FAIL";
  const color = result.pass ? "\x1b[32m" : "\x1b[31m"; // Green or Red

  console.log(`${color}${status}\x1b[0m ${test.name}`);
  console.log(`   ${result.message}\n`);

  if (result.pass) {
    passCount++;
  } else {
    failCount++;
  }
});

console.log("=".repeat(60));
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log("=".repeat(60) + "\n");

if (failCount === 0) {
  console.log("\x1b[32m✓ All checks passed! Payment system is ready.\x1b[0m\n");
  console.log("Next steps:");
  console.log("1. Start your server: npm run dev");
  console.log("2. Test payment flow with Razorpay test credentials");
  console.log("3. Configure webhook URL in Razorpay dashboard");
  console.log("4. Integrate frontend payment UI\n");
} else {
  console.log(
    "\x1b[31m✗ Some checks failed. Please fix the issues above.\x1b[0m\n"
  );
  process.exit(1);
}
