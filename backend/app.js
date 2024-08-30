const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const connectDB = require("./config/connectdb.js");
const userRoutes = require("./routes/authRouter.js");
require("./config/passportJWTStrategy.js");

const {
    port,
    corsOptions
} = require("./constant.js");

const app = express();

// connect to database 
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
    console.log(`Server Start : http://localhost:${port}`);
})
