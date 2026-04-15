const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const serviceProviderModel = require("../../models/serviceProviderModel");
const otpModel = require("../../models/otpModel");
const tokenModel = require("../../models/tokenModel");

const checkProviderValidate = require("../../utils/validation/create/checkCreateProviderValidation");
const sendOTPMails = require("../../utils/sendMail");
const generateOTP = require("../../helper/generateOTP");

class ProviderAuthController {

    async providerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact, service_id, experience, user_address } = req.body;

            if (!user_name || !user_email || !user_password || !service_id || !req.file) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled (including Profile Image and Service)",
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
            const otp = generateOTP();

            // Default Mock Addr if not provided via UI
            const defaultAddr = user_address || {
                houseOrFlatNo: "1",
                street: "Unknown",
                area: "Unknown",
                city: "Unknown",
                state: "Unknown",
                pinCode: "000000",
                country: "India"
            };

            const provider = await userModel.create({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_contact,
                user_role: "provider",
                doc_url: req.file.path,
                user_address: defaultAddr,
            });

            // Create serviceProviderModel securely
            const spDoc = new serviceProviderModel({
                provider_id: provider._id,
                service_id: service_id,
                service_area_zip: ["000000"],
                profile_img: req.file.filename,
                profile_img_url: req.file.path,
                experience: experience || "N/A",
                charges_per_hour: "0"
            });
            await spDoc.save();

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
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const user = await userModel.findOne({ user_email });

            if (!user || user.user_role !== 'provider') {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider not found",
                });
            }

            const providerDetails = await serviceProviderModel.findOne({ provider_id: user._id });

            if (!providerDetails) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider profile not found",
                });
            }

            if (!user.isVerified) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Email not verified yet"
                });
            } else if (user.isBlocked) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Account is blocked"
                });
            } else {
                const isMatch = await bcrypt.compare(user_password, user.user_password);
                if (!isMatch) {
                    return res.status(StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid password"
                    });
                }
                else {
                    const access_token = jwt.sign({
                        user_id: user._id,
                        user_name: user.user_name,
                        user_email: user.user_email,
                        user_role: user.user_role,
                        user_address: user.user_address,
                        user_contact: user.user_contact
                    }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });

                    const refresh_token = jwt.sign({
                        user_id: user._id,
                        user_name: user.user_name,
                        user_email: user.user_email,
                        user_role: user.user_role,
                        user_address: user.user_address,
                        user_contact: user.user_contact
                    }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });

                    const hashedToken = await bcrypt.hash(refresh_token, 10);

                    user.lastLogin = Date.now();
                    await user.save();

                    const tokenObj = new tokenModel({
                        userId: user._id,
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
                            user_id: user._id,
                            user_name: user.user_name,
                            user_email: user.user_email,
                            user_role: user.user_role,
                            user_address: user.user_address,
                            user_contact: user.user_contact,
                            providerDetails
                        },
                        access_token, refresh_token
                    });
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