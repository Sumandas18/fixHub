module.exports = (user, otp) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color:#f3f4f6; padding:20px;">
        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#dc2626,#f97316); padding:24px; text-align:center;">
                <h2 style="color:#ffffff; margin:0;">OTP Resent</h2>
                <p style="color:#ffedd5; margin-top:6px; font-size:14px;">
                    Use the new OTP to verify your email
                </p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="font-size:15px;">Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p style="color:#374151;">
                    You requested a new OTP for email verification.  
                    Please use the OTP below to continue.
                </p>

                <div style="margin:24px 0; text-align:center;">
                    <div style="display:inline-block; background:#fff7ed; border:1px dashed #f97316; border-radius:10px; padding:16px 28px;">
                        <p style="margin:0; font-size:12px; color:#9a3412;">New OTP</p>
                        <h1 style="margin:6px 0 0; letter-spacing:6px; color:#c2410c;">
                            ${otp}
                        </h1>
                    </div>
                </div>

                <p style="font-size:14px; color:#6b7280;">
                    This OTP will expire in <strong>5 minutes</strong>.
                </p>

                <p style="font-size:14px;">
                    If you did not request this OTP, please ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb; padding:16px; text-align:center; border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                    © ${new Date().getFullYear()} Fixhub. All rights reserved.
                </p>
            </div>

        </div>
    </div>
    `;
};