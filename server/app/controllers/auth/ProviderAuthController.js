const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const serviceProviderModel = require("../../models/serviceProviderModel");
const otpModel = require("../../models/otpModel");
const tokenModel = require("../../models/tokenModel");

const sendOTPMails = require("../../utils/sendMail");
const generateOTP = require("../../helper/generateOTP");

class ProviderAuthController {

    async providerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact } = req.body;

            // ── Validate minimal required fields only ──
            // service_id, experience, and image are collected AFTER login via "Complete Profile"
            if (!user_name || !user_email || !user_password || !user_contact) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Name, email, password, and contact are required",
                });
            }

            // ── Check duplicate email ──
            const existProvider = await userModel.findOne({ user_email });
            if (existProvider) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists",
                });
            }

            // ── Hash password ──
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hashSync(user_password, salt);
            const otp = generateOTP();

            // ── Default address (provider fills real address in profile) ──
            const defaultAddr = {
                houseOrFlatNo: "1",
                street: "Unknown",
                area: "Unknown",
                city: "Unknown",
                state: "Unknown",
                pinCode: "000000",
                country: "India"
            };

            // ── Create user record ──
            const provider = await userModel.create({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_contact,
                user_role: "provider",
                user_address: defaultAddr,
            });

            // ── Create placeholder service-provider record (incomplete) ──
            // isProfileCompleted = false means they won't appear in service listings yet
            await serviceProviderModel.create({
                provider_id: provider._id,
                isProfileCompleted: false,
            });

            // ── Save OTP ──
            await otpModel.create({ userId: provider._id, otp });

            // LOG OTP FOR TESTING
            console.log(`[TESTING] OTP for ${user_email} is ${otp}`);

            // ── PERFORMANCE FIX: Non-blocking email ──
            sendOTPMails({ user: provider, type: "newRegister", otp }).catch(console.error);

            // ── Return response IMMEDIATELY ──
            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Provider registered successfully. Please verify your email.",
                data: {
                    _id: provider._id,
                    user_name: provider.user_name,
                    user_email: provider.user_email,
                    user_role: provider.user_role,
                }
            });

        } catch (error) {
            console.error('[ProviderRegister Error]:', error);
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

            // ── Find user ──
            const user = await userModel.findOne({ user_email });
            if (!user || user.user_role !== 'provider') {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider not found",
                });
            }

            // ── Find provider profile (could be incomplete) ──
            const providerDetails = await serviceProviderModel.findOne({ provider_id: user._id });

            // ── Auth checks ──
            if (!user.isVerified) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Email not verified yet"
                });
            }

            if (user.isBlocked) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Account is blocked. Please contact support."
                });
            }

            const isMatch = await bcrypt.compare(user_password, user.user_password);
            if (!isMatch) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            // ── Generate tokens ──
            const tokenPayload = {
                user_id: user._id,
                user_name: user.user_name,
                user_email: user.user_email,
                user_role: user.user_role,
                user_contact: user.user_contact
            };

            const access_token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
            const refresh_token = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });

            const hashedToken = await bcrypt.hash(refresh_token, 10);

            user.lastLogin = Date.now();
            await user.save();

            await tokenModel.create({ userId: user._id, token: hashedToken });

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
                    user_contact: user.user_contact,
                    // Include profile status so frontend knows to show "Complete Profile"
                    isProfileCompleted: providerDetails?.isProfileCompleted || false,
                    providerProfileId: providerDetails?._id || null,
                    providerStatus: providerDetails?.status || null,
                },
                access_token,
                refresh_token
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

}

module.exports = new ProviderAuthController();