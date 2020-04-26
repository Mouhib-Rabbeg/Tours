const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Rabbeg ${process.env.EMAIL_FROM}`;
  }

  createTransport() {
    //send real email
    return nodemailer.createTransport({
      //email trap to simulate email sending
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'filomena71@ethereal.email',
        pass: 'EZfBJRg3ufbjTPAruv',
      },
    });
  }

  async send(template, subject) {
    // 1 render the html based on pug temp

    const html = pug.renderFile(`./views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2 define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlText.fromString(html),
    };
    // 3 create the transporter and send email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natrous Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password Reset (valid for 5 minutes)'
    );
  }
};

const sendEmail = async (options) => {
  //2) define email options
  const mailOptions = {
    from: 'Rabbeg <rabbegmouhib@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3) send the email
  await transporter.sendMail(mailOptions);
};

/* const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    //email trap to simulate email sending
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) define email options
  const mailOptions = {
    from: 'Rabbeg <rabbegmouhib@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3) send the email
  await transporter.sendMail(mailOptions);
}; */
