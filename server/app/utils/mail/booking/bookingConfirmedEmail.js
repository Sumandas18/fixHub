module.exports = (user, booking) => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">Booking Confirmed</h2>
                <p style="color:#dbeafe;font-size:14px;margin-top:6px;">
                    Your service has been scheduled
                </p>
            </div>

            <div style="padding:28px;">
                <p>Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p>
                    Great news! Your booking has been confirmed by the service provider.
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                    <p><strong>Service:</strong> ${booking.serviceName}</p>
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Provider:</strong> ${booking.providerName}</p>
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    You will receive another email once the service is successfully completed.
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