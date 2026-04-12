module.exports = (user, booking, otp) => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">New OTP Issued</h2>
                <p style="color:#ffedd5;font-size:14px;margin-top:6px;">
                    Please use the latest OTP
                </p>
            </div>

            <div style="padding:28px;">
                <p>Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p>
                    As requested, here is your new OTP to complete the service.
                </p>

                <div style="text-align:center;margin:24px 0;">
                    <div style="display:inline-block;background:#fff7ed;border:1px dashed #f97316;border-radius:10px;padding:16px 28px;">
                        <p style="margin:0;font-size:12px;color:#9a3412;">New OTP</p>
                        <h1 style="margin:6px 0 0;letter-spacing:6px;color:#c2410c;">
                            ${otp}
                        </h1>
                    </div>
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    OTP expires in <strong>5 minutes</strong>.
                </p>
            </div>

            <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#9ca3af;margin:0;">
                    © ${new Date().getFullYear()} Fixhub
                </p>
            </div>

        </div>
    </div>
    `;
};