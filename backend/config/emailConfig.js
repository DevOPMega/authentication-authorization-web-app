const nodemailer = require("nodemailer");
const { emailHost, emailPort, emailID, emailPassword } = require("../constant");

let transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false, // true for 465,
    auth: {
        user: emailID,
        pass: emailPassword,
    }
})

module.exports = transporter;