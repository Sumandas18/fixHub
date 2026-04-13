const passwordChangedEmail = (user) => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed Successfully</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .email-container {
            background-color: #ffffff;
            width: 100%;
            max-width: 600px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
          }
          .header {
            background-color: #eb5e28;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            color: #333333;
            font-size: 16px;
            line-height:进步
          }
          .footer {
            margin-top: 20px;
            padding: 10px;
            font-size: 14px;
            color: #777777;
            background-color: #f9f9f9;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">FixHub</div>
          <div class="content">
            <h2>Hi ${user.user_name || "User"},</h2>
            <p>Your password has been successfully updated.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} FixHub. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
};

module.exports = passwordChangedEmail;
