module.exports = (user, provider) => {

    const status = provider.status; 

    const statusConfig = {
        approved: {
            title: 'Provider Approved',
            subtitle: 'Your provider account has been approved',
            message: 'Congratulations! Your provider profile is now active and available for bookings.',
            gradient: '#16a34a,#22c55e',
            color: '#16a34a',
            footer: 'You can now log in and start accepting service requests.'
        },
        rejected: {
            title: 'Provider Rejected',
            subtitle: 'Your provider account has been rejected',
            message: 'Unfortunately, your provider profile could not be approved at this time.',
            gradient: '#dc2626,#ef4444',
            color: '#dc2626',
            footer: 'You may update your profile and apply again.'
        },
        pending: {
            title: 'Account Under Review',
            subtitle: 'Your provider account is currently under review',
            message: 'Thank you for registering as a provider. Our team is reviewing your profile.',
            gradient: '#ca8a04,#facc15',
            color: '#ca8a04',
            footer: 'You will be notified once the review process is complete.'
        }
    };

    const cfg = statusConfig[status];

    return `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;">

            <!-- Header -->
            <div style="
                background:linear-gradient(135deg,${cfg.gradient});
                padding:24px;
                text-align:center;
            ">
                <h2 style="color:#ffffff;margin:0;">${cfg.title}</h2>
                <p style="color:#ecfeff;font-size:14px;margin-top:6px;">
                    ${cfg.subtitle}
                </p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p>Hi <strong>${user.user_name.split(" ")[0]}</strong>,</p>

                <p>${cfg.message}</p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong>Name:</strong> ${user.user_name}</p>
                    <p><strong>Email:</strong> ${user.user_email}</p>
                    <p><strong>Experience:</strong> ${provider.experience}</p>
                    <p><strong>Charges / Hour:</strong> ₹${provider.charges_per_hour}</p>
                    <p><strong>Status:</strong>
                        <span style="font-weight:bold;color:${cfg.color};">
                            ${status.toUpperCase()}
                        </span>
                    </p>

                    ${status === 'rejected' && provider.rejection_reason
            ? `<p><strong>Reason:</strong> ${provider.rejection_reason}</p>`
            : ''
        }
                </div>

                <p style="font-size:14px;color:#6b7280;">
                    ${cfg.footer}
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