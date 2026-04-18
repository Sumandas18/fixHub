const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const otpModel = require("../../models/otpModel");
const tokenModel = require("../../models/tokenModel");

const checkCustomerValidate = require("../../utils/validation/create/checkCreateCustomerValidation");
const sendOTPMails = require("../../utils/sendMail");
const generateOTP = require("../../helper/generateOTP");

class CustomerAuthController {

    async customerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact } = req.body;

            // ── Validate required fields ──
            if (!user_name || !user_email || !user_password || !user_contact ) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const { error } = checkCustomerValidate.validate(req.body);
            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map((err) => err.message),
                });
            }

            // ── Check duplicate email ──
            const existCustomer = await userModel.findOne({ user_email });
            if (existCustomer) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists",
                });
            }

            // ── Hash password & create user ──
            const salt = await bcrypt.genSalt(10);
            const hashPassword = bcrypt.hashSync(user_password, salt);
            const otp = generateOTP();

            const customer = await userModel.create({
                user_name,
                user_email,
                user_password: hashPassword,
                user_contact,
                user_role: "customer"
            });

            // ── Save OTP ──
            await otpModel.create({ userId: customer._id, otp });

            // LOG OTP FOR TESTING
            console.log(`[TESTING] OTP for ${user_email} is ${otp}`);

            // ── PERFORMANCE FIX: Send email NON-BLOCKING (fire & forget) ──
            // Response is returned immediately — email sends in background
            sendOTPMails({ user: customer, type: "newRegister", otp }).catch(console.error);

            // ── Return response IMMEDIATELY after DB save ──
            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: {
                    _id: customer._id,
                    user_name: customer.user_name,
                    user_email: customer.user_email,
                    user_role: customer.user_role,
                }
            });

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
        }
    }

    async customerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const existCustomer = await userModel.findOne({ user_email });

            if (!existCustomer || existCustomer.user_role !== "customer") {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found",
                });
            }

            // ── Block check ──
            if (!existCustomer.isVerified) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Email not verified yet"
                });
            }

            if (existCustomer.isBlocked) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Account is blocked. Please contact support."
                });
            }

            const isMatch = await bcrypt.compare(user_password, existCustomer.user_password);
            if (!isMatch) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid password",
                });
            }

            // ── Generate tokens ──
            const tokenPayload = {
                user_id: existCustomer._id,
                user_role: existCustomer.user_role,
                user_email: existCustomer.user_email,
                user_name: existCustomer.user_name
            };

            const access_token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "1d" });
            const refresh_token = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7d" });

            const hashedToken = await bcrypt.hash(refresh_token, 10);

            // ── Update last login & save refresh token ──
            existCustomer.lastLogin = Date.now();
            await existCustomer.save();

            await tokenModel.create({ userId: existCustomer._id, token: hashedToken });

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
                    user_id: existCustomer._id,
                    user_name: existCustomer.user_name,
                    user_email: existCustomer.user_email,
                    user_role: existCustomer.user_role,
                    user_address: existCustomer.user_address,
                    user_contact: existCustomer.user_contact
                },
                access_token,
                refresh_token
            });

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
        }
    }
}

module.exports = new CustomerAuthController();