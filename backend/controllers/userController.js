const UserModel = require("../models/User");
const sendEmailVerificationOTP = require("../utils/sendEmailVerificationOTP");
const EmailVerificationModel = require("../models/EmailVerification");
const generateTokens = require("../utils/generateTokens");
const setTokenCookies = require("../utils/setTokensCookies");
const refreshAccessToken = require("../utils/refreshAccessToken");
const UserRefreshTokenModel = require("../models/UserRefreshToken");
const { hashPassword, comparePassword } = require("../utils/hash-password");
const generateTokenForPasswordReset = require("../utils/generateTokenForPasswordReset");
const { accessTokenSecretKey } = require("../constant");
const sendResetPasswordLinkEmail = require("../utils/sendResetPasswordLinkEmail");
const jwt = require("jsonwebtoken");

class UserControllers {
  // User Registration
  async userRegistration(req, res) {
    try {
      // Collect Data
      console.log(req.body);
      const { name, email, password, passwordConfirmation } = req.body;
      // Check if all required fields are provided
      if (!name || !email || !password || !passwordConfirmation) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      // Chec if password and passwordConfirmation match
      if (password !== passwordConfirmation) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm Password don't match",
        });
      }

      // Check if email already exits
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: "failed",
          message: "Email already exists",
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = await new UserModel({
        name,
        email,
        password: hashedPassword,
      }).save();

      sendEmailVerificationOTP(req, newUser);

      // Send sucess response
      res.status(201).json({
        status: "success",
        message: "Registration Sucess",
        user: { id: newUser._id, email: newUser.email },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to Register, Please try again later",
      });
    }
  }

  // User Email Verification
  async verifyEmail(req, res) {
    try {
      console.log(req.body)
      const { email, otp } = req.body;

      // Check if all required fields are provided
      if (!email || !otp) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      // Check if email already exits
      const existingUser = await UserModel.findOne({ email });

      // Check if email is already verified
      if (existingUser.verified) {
        return res.status(400).json({
          status: "failed",
          message: "Email is alredy verified",
        });
      }

      // Check if there is a matching email verification OTP
      const emailVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });

      if (!emailVerification) {
        if (!existingUser.verified) {
          await sendEmailVerificationOTP(req, existingUser);
          return res.status(400).json({
            status: "failed",
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP",
        });
      }
      // Check if OTP is expired
      const currentTime = new Date();
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );

      if (currentTime > expirationTime) {
        // OTP expired send new OTP
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "OTP expired, New OTP send to your Email",
        });
      }

      // OTP is valid and not expired, mark email as verified
      existingUser.verified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerificationModel.deleteMany({ userId: existingUser._id });

      return res.status(200).json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to Verifu Email, Please try again later",
      });
    }
  }

  // User Login
  async userLogin(req, res) {
    try {
      const { email, password } = req.body;
      // Check if all required fields are provided
      if (!email || !password) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }
      // Find User by email
      const user = await UserModel.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "Invalid Email or Password",
        });
      }

      // Check if user exists
      if (!user.verified) {
        return res.status(401).json({
          status: "failed",
          message: "Your accout is not verified",
        });
      }

      // Compare passwords
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid email or password",
        });
      }

      // Generate tokens
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await generateTokens(user);

      // Set Cookies
      setTokenCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );

      // Send Success Response with Tokens
      res.status(200).json({
        status: "success",
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles[0],
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_exp: accessTokenExp,
        is_auth: true,
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to login, Please try again later",
      });
    }
  }

  // Get New Access Token Or Refresh Token
  async getNewAccessToken(req, res) {
    try {
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

      res.status(200).json({
        status: "success",
        message: "New tokens generated",
        accessToken,
        refreshToken,
        accessTokenExp
      })
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to generate new token, Please try again later",
      });
    }
  }

  // Profile OR Logged in User
  async userProfile(req, res) {
    res.json({status: "true", message:"authenticated", user: req.user})
  }
  
  // Change Password
  async changeUserPassword(req, res) {
    try {
      const { password, confirmPassword } = req.body;

      // Check if all required fields are provided
      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      // Check is password and confirmPassword is same or not
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "New password and confirm new password doesn't matched"
        });
      }

      // hash new password 
      const hashedPassword = await hashPassword(password);

      // Update user's password
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: {password: hashedPassword}
      });

      // Send successful response
      res.status(200).json({
        status: "success",
        message: "Password change successfully"
      })

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to change password, please try again later."
      })
    }
  }


  // Password Reset
  async userPasswordReset(req, res) {
    try {
      const { password, confirmPassword } = req.body;
      const { id, token } = req.params;

      // Check if all required fields are provided
      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      // Check is password and confirmPassword is same or not
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "New password and confirm new password doesn't matched"
        });
      }

      // Find user by ID
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found"
        })
      }

      // Validate token
      jwt.verify(token, accessTokenSecretKey);

      // hash new password 
      const hashedPassword = await hashPassword(password);

      // Update user's password
      await UserModel.findByIdAndUpdate(user._id, {
        $set: {password: hashedPassword}
      });

      // Send successful response
      res.status(200).json({
        status: "success",
        message: "Password change successfully"
      })

    } catch (error) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
        res.status(500).json({
          status: "failed",
          message: "Token expired, Please request a new password reset link."
        })
      }
      res.status(500).json({
        status: "failed",
        message: "Unable to reset password, please try again later."
      })
    }
  }

  // Send Password Reset Email
  async sendUserPasswordResetEmail(req, res) {
    try {
      const { email } = req.body;

      // Check if all required fields are provided
      if (!email) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "Email doesn't exist"
        })
      }

      // Generate token for password reset 
      const token = generateTokenForPasswordReset(user);

      // Send password reset email
      await sendResetPasswordLinkEmail(user, token);

      // Send success response
      res.status(200).json({
        status: "success",
        message: "Password reset email sent. Please check your email."
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to send password reset email, please try again later."
      })
    }
  }

  // Logout
  async userLogout(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token;
      console.log("User Logout: ", refreshToken);
      await UserRefreshTokenModel.findOneAndUpdate(
        { token: refreshToken },
        { $set: { blacklisted: true }}
      )
      // Clear access token and refresh token cookies
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      res.clearCookie("is_auth");

      res.status(200).json({
        status: "success",
        message: "Logout successful"
      })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to logout, please try again later"
      });
    }
  }
}

module.exports = new UserControllers();
