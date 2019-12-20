const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'romakova@yandex.ru',
    subject: 'Thanks for joining in!',
    text: `Hello ${name}! Welcome to the task app!`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'romakova@yandex.ru',
    subject: 'Cancellation notification',
    text: `Hello ${name}! Give us feedback what went wrong!`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
