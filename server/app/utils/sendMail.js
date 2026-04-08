const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: (process.env.EMAIL_USER || "").trim(),
    pass: (process.env.EMAIL_PASS || "").trim(),
  },
});

async function sendCredentials({ name, email, employeeId, password }) {
  const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}`;

  await transporter.sendMail({
    from: `"Employee System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Employee Login Credentials",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to Employee System</h2>
                </div>
                <div style="padding: 28px;">
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>Your employee account has been created. Here are your login details:</p>

                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Employee ID:</strong> ${employeeId}</p>
                        <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 4px 0;"><strong>Password:</strong> ${password}</p>
                    </div>

                    <p>Please change your password after your first login.</p>

                    <div style="text-align: center; margin: 24px 0;">
                        <a href="${loginUrl}" 
                           style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                           Login to Your Account →
                        </a>
                    </div>

                    <p style="color: #6b7280; font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:<br/>
                    <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
                </div>
                <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Employee System. All rights reserved.</p>
                </div>
            </div>
        `,
  });
}

module.exports = { sendCredentials };
