const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Yahia Elfaramawy <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return 1;
    }
    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // Send actual email
    // 1) Render HTML
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset your password.');
  }

  // 3) Actually send the email
};
