module.exports.taskCompletedOtpEmail = (user, booking, otp) => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">Service Completed</h2>
                <p style="color:#dcfce7;font-size:14px;margin-top:6px;">
                    OTP required to finalize the service
                </p>
            </div>

            <div style="padding:28px;">
                <p>Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p>
                    The service provider has marked your booking as <strong>completed</strong>.
                    Please share the OTP below with the provider to finalize the service.
                </p>

                <div style="text-align:center;margin:24px 0;">
                    <div style="display:inline-block;background:#ecfdf5;border:1px dashed #22c55e;border-radius:10px;padding:16px 28px;">
                        <p style="margin:0;font-size:12px;color:#15803d;">Completion OTP</p>
                        <h1 style="margin:6px 0 0;letter-spacing:6px;color:#166534;">
                            ${otp}
                        </h1>
                    </div>
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    This OTP is valid for <strong>5 minutes</strong>.  
                    Do not share it with anyone except the service provider.
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