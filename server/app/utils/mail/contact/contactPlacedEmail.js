module.exports = (contact) => {
    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:24px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">Query Received</h2>
                <p style="color:#dbeafe;font-size:14px;margin-top:6px;">
                    We’ve successfully received your message
                </p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p>Hi <strong>${contact.name.split(" ")[0]}</strong>,</p>

                <p>
                    Thank you for reaching out to Fixhub. Your query has been successfully submitted.
                    Our support team will review it and get back to you shortly.
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong>Contact ID:</strong> ${contact.contactId}</p>
                    <p><strong>Subject:</strong> ${contact.subject}</p>
                    <p><strong>Status:</strong>
                        <span style="font-weight:bold;color:#ca8a04;">PENDING</span>
                    </p>
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    Please keep this Contact ID for future reference.
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