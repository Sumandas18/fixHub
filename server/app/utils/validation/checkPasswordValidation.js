const JOI = require("joi");

const checkPasswordValidate = JOI.object({
    
     user_password: JOI.string().min(8).max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password must not exceed 30 characters",
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character"
        })
});

module.exports = checkPasswordValidate;