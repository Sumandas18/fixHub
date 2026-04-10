module.exports = (contact) => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">We’ve Replied to Your Query</h2>
                <p style="color:#ecfeff;font-size:14px;margin-top:6px;">
                    Your request has been resolved
                </p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p>Hi <strong>${contact.name.split(" ")[0]}</strong>,</p>

                <p>
                    Thank you for your patience. Below is our response to your query.
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong>Contact ID:</strong> ${contact.contactId}</p>
                    <p><strong>Subject:</strong> ${contact.subject}</p>
                    <p><strong>Your Message:</strong><br/>${contact.message}</p>
                    <hr style="margin:12px 0;border:none;border-top:1px solid #e5e7eb;" />
                    <p><strong>Our Reply:</strong><br/>${contact.reply}</p>
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    If you have any further questions, feel free to reply to this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#9ca3af;margin:0;">
                    © ${new Date().getFullYear()} Fixhub
                </p>
            </div>

        </div>
    </div>
    `;
};