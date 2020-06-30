// nodemailer
const nodemailer = require('nodemailer');

// transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'felix.wurst@gmail.com',
        pass: 'myPassword'
    }
});

// sendEmail function
function sendEmail(name, email, subject, message, callback) {
    const mailOptions = {
        from: 'felix.wurst@gmail.com',
        to: 'felix.wurst@gmail.com',
        subject: subject,
        text: email + '\n' + name + '\n' + message
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            callback(false);
        } else {
            console.log(info.response);
            callback(true);
        }
    });
}

// export module
module.exports = { sendEmail };
