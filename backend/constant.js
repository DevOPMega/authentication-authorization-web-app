const port=process.env.PORT;

const frontendHost = process.env.FRONTEND_HOST;

const corsOptions = {
    origin: `${process.env.FRONTEND_HOST}`,
    credentials: true,
    optionSuccessStatus: 200
}

const databaseURI = `${process.env.MONGODB_URI}`;

const salt = Number(process.env.SALT);

const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailID = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIl_PASS;
const emailFrom = process.env.EMAIL_FROM;

const accessTokenSecretKey = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

module.exports ={
    port,
    frontendHost,
    corsOptions,
    databaseURI,
    salt,
    emailHost,
    emailPort,
    emailID,
    emailPassword,
    emailFrom,
    accessTokenSecretKey,
    refreshTokenSecretKey
}