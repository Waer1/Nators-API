const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.lastName = user.name.split(' ')[1];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // using sendgrid
      return 1;
    }

    // 1- creating a new transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // render the html html
    const html = pug.render(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject,
    });

    // define email options
    const mailoptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html),
    };

    // create transport and send email
    await this.createTransport().sendMail(mailoptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the nators family!');
  }

  async sendPasswordRsest() {
    await this.send(
      'passwordReset',
      'your password reset token its only valid for 10 mins'
    );
  }
};
