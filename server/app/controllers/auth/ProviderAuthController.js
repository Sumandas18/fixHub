const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const serviceProviderModel = require("../../models/serviceProviderModel");
const otpModel = require("../../models/otpModel");

const checkProviderValidate = require("../../utils/validation/create/checkCreateProviderValidation");
const sendOTPMails = require("../../utils/sendMail");

class ProviderAuthController {

    async providerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact, user_address } = req.body;

            if (!user_name || !user_email || !user_password) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const { error } = checkProviderValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map((err) => err.message),
                });
            }

            const existProvider = await userModel.findOne({ user_email });

            if (existProvider) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists",
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hashSync(user_password, salt);
            const otp = Math.floor(1000 + Math.random() * 9000);

            const provider = await userModel.create({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_contact,
                user_role: "provider",
                doc_url: req.file ? req.file.path : null,
                user_address,
            });

            const otpObj = new otpModel({ userId: provider._id, otp });
            await otpObj.save();

            await sendOTPMails({ user: provider, type: "newRegister", otp });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Provider registered successfully. Please verify your email",
                data: provider,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async providerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const user = await userModel.findOne({ user_email });
            const providerDetails = await serviceProviderModel.findOne({ provider_id: user._id });

            if (!user || user.user_role != 'provider' || !providerDetails) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider not found",
                });
            }
            else {
                if (!user.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Email not verified yet"
                    });
                }
                else if (user.isBlocked) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Account is blocked"
                    });
                }
                else {
                    const isMatch = await bcrypt.compare(user_password, user.user_password);
                    if (!isMatch) {
                        return res.status(StatusCode.BAD_REQUEST).json({
                            success: false,
                            message: "Invalid password"
                        });
                    }
                    else {
                        const token = jwt.sign({
                            user_id: user._id,
                            user_name: user.user_name,
                            user_email: user.user_email,
                            user_role: user.user_role,
                            user_address: user.user_address,
                            user_contact: user.user_contact
                        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                        user.lastLogin = Date.now();
                        await user.save();

                        return res.status(StatusCode.SUCCESS).json({
                            success: true,
                            message: "Login successful",
                            data: {
                                user_id: user._id,
                                user_name: user.user_name,
                                user_email: user.user_email,
                                user_role: user.user_role,
                                user_address: user.user_address,
                                user_contact: user.user_contact,
                                providerDetails
                            },
                            token
                        });
                    }
                }
            }

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

}

module.exports = new ProviderAuthController();