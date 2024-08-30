const jwt = require("jsonwebtoken");

const { accessTokenSecretKey, refreshTokenSecretKey } = require("../constant");
const UserRefreshTokenModel = require("../models/UserRefreshToken")

async function generateTokens(user) {
    try {
        const payload = { _id: user._id, roles: user.roles};
        console.log(payload);
        // Access Token
        const accessTokenExp = Math.floor(Date.now()/1000) + 100;
        const accessToken = jwt.sign(
            {
                ...payload,
                exp: accessTokenExp
            },
            accessTokenSecretKey
        )

        // Refresh Token
        const refreshTokenExp = Math.floor(Date.now()/1000) + 5 * 24 * 60 * 60;
        const refreshToken = jwt.sign(
            {
                ...payload,
                exp: refreshTokenExp
            },
            refreshTokenSecretKey
        );

        const userRefreshToken = await UserRefreshTokenModel.findOne({
            userId: user._id
        });
        if (userRefreshToken) 
            await UserRefreshTokenModel.deleteOne({userId: user._id});

        // Save new refresh token in database
        await new UserRefreshTokenModel({
            userId: user._id,
            token: refreshToken
        }).save();

        return { 
            accessToken,
            refreshToken,
            accessTokenExp,
            refreshTokenExp
        };
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
}

module.exports = generateTokens;