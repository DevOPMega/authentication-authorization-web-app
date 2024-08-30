const jwt = require("jsonwebtoken");

const { accessTokenSecretKey } = require("../constant");

function generateTokenForPasswordReset(user) {
    return jwt.sign({ userID: user._id }, accessTokenSecretKey, { expiresIn: "15m"} );
}

module.exports = generateTokenForPasswordReset;