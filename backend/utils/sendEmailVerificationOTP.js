const transporter = require("../config/emailConfig");
const { frontendHost, emailFrom } = require("../constant");
const EmailVerificationModel = require("../models/EmailVerification");

async function sendEmailVerificationOTP(req, user) {
    // Generate a random 4 digit number 
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP in databases
    await new EmailVerificationModel({
        userId: user._id,
        otp: otp.toString()
    }).save();
    
    // OTP Verification Link
    const otpVerificationLink = `${frontendHost}/accout/verify-email`

    await transporter.sendMail({
        from: emailFrom,
        to: user.email,
        subject: "OTP: Verify Your Accout",
        html: `<p>Dear ${user.name},</p><br><p>Thank you for signing up with out service. To complete your registration, please verify your email address by entering the following one-time password (OTP): ${otpVerificationLink} </p>
        <h2>OTP: ${otp}</h2>
        <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>
        `
    })
}

module.exports = sendEmailVerificationOTP;