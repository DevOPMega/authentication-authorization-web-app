const bcrypt = require("bcrypt");
const { salt } = require("../constant");

async function hashPassword(password) {
  try {
    // Hash the password
    const hashSalt = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, hashSalt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error in hash password");
  }
}

async function comparePassword(password, hashPassword) {
    try {
        const isMatch = await bcrypt.compare(password, hashPassword);
        console.log(isMatch);
        return isMatch;
    } catch (error) {
        throw new Error("Error in compare hash password");
    }
}

module.exports = {
    hashPassword,
    comparePassword
}
