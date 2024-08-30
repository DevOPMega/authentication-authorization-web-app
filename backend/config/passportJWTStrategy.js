const UserModel = require("../models/User");
const {
    Strategy: JwtStrategy,
    ExtractJwt
} = require("passport-jwt");
const passport = require("passport");
const { accessTokenSecretKey } = require("../constant");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: accessTokenSecretKey
};

passport.use(new JwtStrategy(
    opts,
    async function (jwt_payload, done) {
        try {
            const user = await UserModel.findOne({_id: jwt_payload._id}).select("-password");
            if (user)
                return done(null, user);
            
            return done(null, false);
        } catch (error) {
            return done(err, false);
        }
    }
))