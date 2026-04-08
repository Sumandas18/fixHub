module.exports = (user, otp) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color:#f3f4f6; padding:20px;">
        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed); padding:24px; text-align:center;">
                <h2 style="color:#ffffff; margin:0;">Welcome to Fixhub 🎉</h2>
                <p style="color:#e0e7ff; margin-top:6px; font-size:14px;">
                    Verify your email to get started
                </p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="font-size:15px;">Hi <strong>${user.name.split(" ")[0]}</strong>,</p>

                <p style="color:#374151;">
                    Thank you for registering with <strong>Fixhub</strong>.  
                    Please use the OTP below to verify your email address.
                </p>

                <div style="margin:24px 0; text-align:center;">
                    <div style="display:inline-block; background:#f3f4f6; border:1px dashed #6366f1; border-radius:10px; padding:16px 28px;">
                        <p style="margin:0; font-size:12px; color:#6b7280;">Your OTP</p>
                        <h1 style="margin:6px 0 0; letter-spacing:6px; color:#4338ca;">
                            ${otp}
                        </h1>
                    </div>
                </div>

                <p style="font-size:14px; color:#6b7280;">
                    This OTP is valid for <strong>5 minutes</strong>.  
                    Do not share it with anyone.
                </p>

                <p style="font-size:14px;">
                    If you didn’t request this, please ignore this email.
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