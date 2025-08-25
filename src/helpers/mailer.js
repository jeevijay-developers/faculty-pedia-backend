const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_MAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

exports.sendMail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_MAIL,
      to,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
      } else {
        console.log("Email sent: " + info.response);
        return { success: true, message: "Email sent successfully" };
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
