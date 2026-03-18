const JOI = require("joi");

const checkAdminValidate = JOI.object({
    user_name: JOI.string().min().min(3).max(30).required(),
    user_email: JOI.string().email({ minDomainSegments: 2 }),
    user_password: JOI.string().min(8).max(30).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character"
        })
});

module.exports = checkAdminValidate;