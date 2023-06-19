const nodemailer = require('nodemailer');

const sendEmail = async (Options) => {
  // create the transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // options
  const mailoptions = {
    from: process.env.EMAIL_FROM,
    to: Options.email,
    subject: Options.subject,
    text: Options.message,
  };

  // send the email
  await transporter.sendMail(mailoptions);
};

module.exports = sendEmail;
