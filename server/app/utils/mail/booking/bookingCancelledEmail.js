module.exports = (user, booking,service, reason = "") => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">Booking Cancelled</h2>
            </div>

            <div style="padding:28px;">
                <p>Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p>
                    Unfortunately, your booking has been cancelled.
                </p>

                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong>Booking ID:</strong> ${booking._id.toString().slice(-6).toUpperCase()}</p>
                    <p><strong>Service:</strong> ${service.service_name}</p>
                    ${reason
            ? `<p><strong>Reason:</strong> ${reason}</p>`
            : ""
        }
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    If you have any questions, feel free to contact support.
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