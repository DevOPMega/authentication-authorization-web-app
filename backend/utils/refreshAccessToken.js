const UserModel = require("../models/User");
const UserRefreshTokenModel = require("../models/UserRefreshToken");
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const generateTokens = require("./generateTokens");

async function refreshAccessToken(req, res) {
  try {
    const oldRefreshToken = req.cookies.refresh_token;
    console.log(req.cookies);

    // Verify refresh token is valid or not
    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      return res.send(401).send({ 
        status: "failed",
        message: "Invalid refresh token"
      });
    }

    // Find user based on refresh token details id
    const user = await UserModel.findById(tokenDetails._id);
    if(!user) {
      return res.status(404).send({ 
        status: "failed",
        message: "User not found"
      });
    }

    const userRefreshToken = await UserRefreshTokenModel.findOne({userId: tokenDetails._id});

    if(oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized access"
      })
    }

    // Generate new tokens
    const {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    } = await generateTokens(user);

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    }


  } catch (error) {
    console.log(error);
  }
}

module.exports = refreshAccessToken;

// 1:51:12