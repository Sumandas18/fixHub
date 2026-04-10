module.exports = (user, isBlocked, reason = null) => {

    const config = {
        blocked: {
            title: 'Account Blocked',
            subtitle: 'Your account has been temporarily blocked',
            message: 'Your account access has been restricted due to a policy or security review.',
            gradient: '#dc2626,#ef4444',
            color: '#dc2626',
            footer: 'If you believe this is a mistake, please contact support for assistance.'
        },
        unblocked: {
            title: 'Account Unblocked',
            subtitle: 'Your account has been restored',
            message: 'Good news! Your account access has been successfully restored.',
            gradient: '#16a34a,#22c55e',
            color: '#16a34a',
            footer: 'You can now log in and continue using Fixhub services.'
        }
    };

    const cfg = isBlocked ? config.blocked : config.unblocked;

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
                <p style="color:#fee2e2;font-size:14px;margin-top:6px;">
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
                    <p><strong>Account Status:</strong>
                        <span style="font-weight:bold;color:${cfg.color};">
                            ${isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                    </p>

                    ${isBlocked && reason
            ? `<p><strong>Reason:</strong> ${reason}</p>`
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