const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");
const otpModel = require("../models/otpModel");
const tokenModel = require("../models/tokenModel");

const StatusCode = require("../utils/statusCode");
const passwordValidation = require("./../utils/validation/checkPasswordValidation");
const sendOTPMails = require("../utils/sendMail");
const generateOTP = require("../helper/generateOTP");

class UserController {

    async resendOTP(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "All fields are required"
                })
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "User not found"
                })
            }
            else {
                if (user.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "User already verified"
                    })
                }
                else {
                    const otp = generateOTP();

                    const otpObj = new otpModel({ userId: user._id, otp });
                    await otpObj.save();

                    await sendOTPMails({ user, otp, type: "resendOTP" });

                    return res.status(StatusCode.SUCCESS).json({
                        success: success,
                        message: "OTP re-send successfully"
                    })
                }
            }

        }
        catch (err) {
            console.error('[ResendOTP Error]:', err);
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            })
        }
    }

    async verifyOTP(req, res) {
        try {
            const { userId, otp } = req.body;

            if (!userId || !otp) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "All fields are required"
                })
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "User not found"
                })
            }
            else {
                if (user.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "User already verified"
                    })
                }
                else {
                    const checkOTP = await otpModel.findOne({ userId: user._id, otp });

                    if (!checkOTP) {
                        return res.status(StatusCode.BAD_GATEWAY).json({
                            success: false,
                            message: "Invalid OTP"
                        })
                    }

                    // Strict manual 5 min check
                    const diffMins = (new Date() - new Date(checkOTP.createdAt)) / 60000;
                    if (diffMins > 5) {
                        await otpModel.deleteMany({ userId: user._id });
                        return res.status(StatusCode.BAD_GATEWAY).json({
                            success: false,
                            message: "OTP has expired. Please request a new one."
                        })
                    }
                    else {
                        user.isVerified = true;
                        await user.save();

                        await otpModel.deleteMany({ userId: user._id });

                        return res.status(StatusCode.SUCCESS).json({
                            success: true,
                            message: "Email verification successful"
                        })
                    }
                }
            }
        }
        catch (err) {
            console.error('[VerifyOTP Error]:', err);
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            })
        }
    }

    async blockUnblockUser(req, res) {
        try {
            const userId = req.params.id;
            const authRole = req.user.user_role;

            if (!authRole) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            if (!userId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "ID is required"
                })
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (authRole !== 'admin') {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthenticated"
                });
            }

            user.isBlocked = !user.isBlocked;
            await user.save();

            await sendOTPMails({ user, isBlocked: !user.isBlocked, reason: null });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
            });

        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            const user = req.user;

            if (!user) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            if (!oldPassword || !newPassword) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Old and new passwords are required"
                });
            }

            const { data, error } = passwordValidation.validate({ user_password: newPassword });

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const userDetails = await userModel.findById(user.user_id);

            const checkOldPassword = await bcrypt.compare(oldPassword, userDetails.user_password);

            if (!checkOldPassword) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Old password doesn't match"
                });
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const user_password = bcrypt.hashSync(newPassword, salt);

                userDetails.user_password = user_password;
                await userDetails.save();

                return res.status(StatusCode.SUCCESS).json({
                    success: true,
                    message: "Password updated successfully"
                });
            }
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async fetchProfile(req, res) {
        try {
            const user = req.user;

            if (!user) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Logged profile data",
                data: user
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async userLogout(req, res) {
        try {
            const refreshToken = req.cookies?.refresh_token;

            if (!refreshToken) {
                return res.status(StatusCode.SUCCESS).json({
                    status: true,
                    message: "Already logged out",
                });
            }

            let decoded;

            try {
                decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            }
            catch (err) {
                res.clearCookie("refresh_token");
                return res.status(StatusCode.SUCCESS).json({
                    status: true,
                    message: "Logged out successfully",
                });
            }

            const existToken = await tokenModel.findOne({ userId: decoded.user_id });

            if (existToken && existToken.token) {
                const isMatch = await bcrypt.compare(refreshToken, existToken.token);

                if (isMatch) {
                    existToken.token = null;
                    await existToken.save();
                }
            }

            res.clearCookie("refresh_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });

            return res.status(StatusCode.SUCCESS).json({
                status: true,
                message: "Logout successful",
            });
        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                message: err.message
            });
        }
    }

}

module.exports = new UserController();