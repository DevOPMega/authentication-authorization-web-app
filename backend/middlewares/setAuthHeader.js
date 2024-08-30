const isTokenExpired = require("../utils/isTokenExpired");

async function setAuthHeader(req, res, next) {
    try {
        const accessToken = req.cookies.access_token;
        // console.log("accessToken", accessToken);
        if (accessToken || !isTokenExpired(accessToken)) {
            req.headers["authorization"] = `Bearer ${accessToken}`;
        }

        next();

    } catch (error) {
        console.log("Error adding access token to header", error.message);
    }
}

module.exports = setAuthHeader;