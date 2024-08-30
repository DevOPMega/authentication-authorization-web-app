const express = require("express");
const UserController = require("../controllers/userController");
const passport = require("passport");
const accessTokenAutoRefresh = require("../middlewares/accessTokenAutoRefresh");

const router = express.Router();

// Public Routes
router.post("/register", UserController.userRegistration);
router.post("/verify-email", UserController.verifyEmail);
router.post("/login", UserController.userLogin);
router.post("/refresh-token", UserController.getNewAccessToken);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);
router.post("/reset-password-link", UserController.sendUserPasswordResetEmail);

// Protected Routes
router.get("/me", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.userProfile);
router.post("/change-password", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.changeUserPassword);
router.post("/logout", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.userLogout);

module.exports = router;

// 2:47:37