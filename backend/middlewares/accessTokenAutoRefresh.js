const isTokenExpired = require("../utils/isTokenExpired");
const refreshAccessToken = require("../utils/refreshAccessToken");
const setTokenCookies = require("../utils/setTokensCookies");

async function accessTokenAutoRefresh(req, res, next) {
  try {
    const accessToken = req.cookies.access_token;
    // If accesToken not expired
    if (accessToken || !isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    // If accessToken is expired
    if (!accessToken || isTokenExpired(accessToken)) {
      const oldRefreshToken = req.cookies.refresh_token;
      if (!oldRefreshToken) {
        return res.status(404).json({
          status: "failed",
          message: "Request token not found"
        });
      }
      // Get new access token using refresh token
      const { 
        accessToken, 
        refreshToken, 
        accessTokenExp, 
        refreshTokenExp 
      } = await refreshAccessToken(req, res);

      // Set new tokens to cookies
      setTokenCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );


      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    next();
  } catch (error) {
    console.log("Error adding access token to header", error.message);
  }
}

module.exports = accessTokenAutoRefresh;


// 2:22:45