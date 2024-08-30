const transporter = require("../config/emailConfig");
const { frontendHost, emailFrom } = require("../constant");

async function sendResetPasswordLinkEmail(user, token) {
    // Reset password link
    const resetLink = `${frontendHost}/account/reset-password-confirm/${user._id}/${token}`;

    await transporter.sendMail({
        from: emailFrom,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Dear ${user.name},</p><br><p>Please
        <a href="${resetLink}">click here</a> to reset your
        password</p>
        `
    });
}

module.exports = sendResetPasswordLinkEmail;