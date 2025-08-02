const nodemailer = require("nodemailer");

// Create a transporter using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  },
});
// update
/**
 * Send an email using Nodemailer.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email body (plain text).
 * @param {function} callback - Callback function to handle the result.
 */
function sendEmail(to, subject, text, callback) {
    const htmlContent = `
    <html>
      <head>
        <style>
          /* Add your CSS styles here */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          p {
            color: #777;
          }
          .otp {
            font-size: 24px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${subject}</h1>
          <p>Your OTP is:</p>
          <p class="otp">${text}</p>
          <p>It will expire in 5 minutes.</p>
        </div>
      </body>
    </html>
  `;
  
  // Email data
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    //   console.error("Error sending email: ", error);
    //   callback(error, null);
    } else {
    //   console.log("Email sent: ", info.response);
    //   callback(null, info.response);
    }
  });
}

module.exports = sendEmail;