const mongoose = require("mongoose");
const { databaseURI } = require("../constant");


const connectDB = async () => {
    try {   
        const dbOptions = {
            dbName: "passporjsauth"
        }
        await mongoose.connect(databaseURI, dbOptions);
        console.log("connected successfully");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;