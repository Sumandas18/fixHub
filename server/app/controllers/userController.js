const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");
const otpModel = require("../models/otpModel");
const tokenModel = require("../models/tokenModel");

const StatusCode = require("../utils/statusCode");
const passwordValidation = require("./../utils/validation/checkPasswordValidation");
const checkCustomerUpdateValidate = require("../utils/validation/update/checkUpdateCustomerValidation");
const sendOTPMails = require("../utils/sendMail");
const generateOTP = require("../helper/generateOTP");

class UserController {

    async resendOTP(req, res) {
        try {
            const { userId, email } = req.body;

            if (!userId && !email) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "userId or email is required"
                })
            }

            let user;
            if (email) {
                user = await userModel.findOne({ user_email: email });
            } else {
                user = await userModel.findById(userId);
            }

            if (!user) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                })
            }
            else {
                if (user.isVerified) {
                    return res.status(StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "User already verified"
                    })
                }
                else {
                    const otp = generateOTP();
                    await otpModel.deleteMany({ userId: user._id });

                    const otpObj = new otpModel({ userId: user._id, otp });
                    await otpObj.save();

                    await sendOTPMails({ user, otp, type: "resendOTP" });

                    return res.status(StatusCode.SUCCESS).json({
                        success: true,
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
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All fields are required"
                })
            }

            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid User ID format"
                })
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User not found"
                })
            }

            if (user.isVerified) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already verified"
                })
            }

            const checkOTP = await otpModel
                .findOne({ userId: user._id })
                .sort({ createdAt: -1 });

            // FIX OTP comparison (type-safe)
            if (!checkOTP || String(checkOTP.otp) !== String(otp)) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid OTP"
                });
            }

            // FIX expiration logic
            const now = Date.now();
            const created = new Date(checkOTP.createdAt).getTime();
            const diff = now - created;

            console.log("Time diff(ms):", diff);

            // SET expiry = 5 minutes
            if (diff > 5 * 60 * 1000) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "OTP expired"
                });
            }

            user.isVerified = true;
            await user.save();

            await otpModel.deleteMany({ userId: user._id });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Email verification successful"
            })
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
            sendOTPMails({ user, isBlocked: user.isBlocked, type: "blockunblockAccount" }).catch(console.error);

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

                await sendOTPMails({ user: userDetails, type: "updatePassword" });

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

    async updateProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            const { user_name, user_contact, user_address } = req.body;
            const { error, value } = checkCustomerUpdateValidate.validate({ user_name, user_contact, user_address }, { abortEarly: false, stripUnknown: true });

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map((err) => err.message).join(', ')
                });
            }

            const userDetails = await userModel.findById(user.user_id);
            if (!userDetails) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (value.user_name) {
                userDetails.user_name = value.user_name;
            }
            if (value.user_contact) {
                userDetails.user_contact = value.user_contact;
            }
            if (value.user_address) {
                userDetails.user_address = {
                    ...userDetails.user_address,
                    ...value.user_address
                };
            }

            await userDetails.save();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Profile updated successfully",
                data: userDetails
            });
        } catch (error) {
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

            const userDetails = await userModel.findById(user.user_id).lean();

            if (userDetails && userDetails.user_role === 'provider') {
                const serviceProviderModel = require('../models/serviceProviderModel');
                const providerProfile = await serviceProviderModel.findOne({ provider_id: userDetails._id }).lean();

                userDetails.isProfileCompleted = !!providerProfile;
                userDetails.providerStatus = providerProfile?.status || 'pending';
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Logged profile data",
                data: userDetails
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