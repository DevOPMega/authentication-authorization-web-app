const jwt = require("jsonwebtoken");

function isTokenExpire(token) {
    if (!token) {
        return true;
    }
    const decodedToken = jwt.decode(token);
    const currentTime = Date.now();
    return decodedToken.exp < currentTime;
}

module.exports = isTokenExpire;