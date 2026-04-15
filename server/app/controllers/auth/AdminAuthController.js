const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const StatusCode = require("../../utils/statusCode");
const adminModel = require("../../models/adminModel");
const otpModel = require("../../models/otpModel");
const tokenModel = require("../../models/tokenModel");

const checkAdminValidate = require("../../utils/validation/create/checkCreateAdminValidation");
const sendOTPMails = require("../../utils/sendMail");
const generateOTP = require("../../helper/generateOTP");

class AdminAuthController {

    async adminRegister(req, res) {
        try {
            const { 
                user_name, user_email, user_password,
                first_name, middle_name, last_name, phone_number,
                office_address, company_email, services_overview, establishment_date
            } = req.body;

            if (!user_name || !user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const { data, error } = checkAdminValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const existAdmin = await adminModel.findOne({ user_email });
            if (existAdmin) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exist"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = bcrypt.hashSync(user_password, salt);
            const otp = generateOTP();

            // Handle optional files if Upload middleware was used
            let profile_img, signature_img;
            if (req.files) {
                if (req.files.profile_img) profile_img = req.files.profile_img[0].path;
                if (req.files.signature_img) signature_img = req.files.signature_img[0].path;
            }

            const adminObj = new adminModel({ 
                user_name, user_email, user_password: hashPassword, user_role: "admin",
                first_name, middle_name, last_name, phone_number,
                office_address, company_email, services_overview, establishment_date,
                profile_img, signature_img
            });
            const admin = await adminObj.save();

            const otpObj = new otpModel({ userId: admin._id, otp });
            await otpObj.save();

            await sendOTPMails({ user: admin, type: "newRegister", otp });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: admin
            });
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async adminLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const existAdmin = await adminModel.findOne({ user_email });
            if (!existAdmin || existAdmin.user_role != "admin") {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User doesn't exist"
                });
            }
            else {
                if (!existAdmin.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Email not verified yet"
                    });
                }
                else if (existAdmin.isBlocked) {
                    return res.status(StatusCode.FORBIDDEN).json({
                        success: false,
                        message: "Your account is blocked by admin"
                    });
                }
                else {
                    const verifyPassword = await bcrypt.compare(user_password, existAdmin.user_password);

                    if (!verifyPassword) {
                        return res.status(StatusCode.BAD_REQUEST).json({
                            success: false,
                            message: "Invalid password"
                        });
                    }
                    else {
                        const access_token = jwt.sign({
                            user_id: existAdmin._id,
                            user_name: existAdmin.user_name,
                            user_email: existAdmin.user_email,
                            user_role: existAdmin.user_role
                        }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });

                        const refresh_token = jwt.sign({
                            user_id: existAdmin._id,
                            user_name: existAdmin.user_name,
                            user_email: existAdmin.user_email,
                            user_role: existAdmin.user_role
                        }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });

                        const hashedToken = await bcrypt.hash(refresh_token, 10);

                        existAdmin.lastLogin = Date.now();
                        await existAdmin.save();

                        const tokenObj = new tokenModel({
                            userId: existAdmin._id,
                            token: hashedToken
                        });

                        await tokenObj.save();

                        res.cookie("refresh_token", refresh_token, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "strict",
                            maxAge: 7 * 24 * 60 * 60 * 1000,
                        });

                        return res.status(StatusCode.SUCCESS).json({
                            success: true,
                            message: "Login successful",
                            data: {
                                user_name: existAdmin.user_name,
                                user_email: existAdmin.user_email,
                                user_role: existAdmin.user_role
                            },
                            access_token, refresh_token
                        });
                    }
                }
            }
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

}

module.exports = new AdminAuthController();