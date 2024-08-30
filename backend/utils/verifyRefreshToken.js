const jwt = require("jsonwebtoken");
const UserRefreshTokenModel = require("../models/UserRefreshToken");
const { refreshTokenSecretKey } = require("../constant");

async function verifyRefreshToken(refreshToken) {
    try {
        // Find the refresh token in database
        const userRefreshToken = await UserRefreshTokenModel.findOne({ token: refreshToken});

        // If refresh token not found, reject with error
        if (!userRefreshToken) {
            throw { error: true, message: "Invalid refresh token"};
        }

        // Verify the refresh token
        const tokenDetails = jwt.verify(refreshToken, refreshTokenSecretKey);

        // If verification successful, resolve with token details
        return {
            tokenDetails,
            error: false,
            message: "Valid refresh token"
        }

    } catch (error) {
        throw { error: true, message: "Invalid refresh token"};
    }
}

module.exports = verifyRefreshToken;
