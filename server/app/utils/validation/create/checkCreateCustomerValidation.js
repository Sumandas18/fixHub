const JOI = require("joi");

const addressSchema = JOI.object({
    houseOrFlatNo: JOI.string().min(1).required(),
    buildingName: JOI.string().allow("", null),
    street: JOI.string().min(2).required(),
    area: JOI.string().min(2).required(),
    landmark: JOI.string().allow("", null),
    city: JOI.string().min(2).required(),
    district: JOI.string().allow("", null),
    state: JOI.string().min(2).required(),
    pinCode: JOI.string().pattern(/^[0-9]{6}$/).required()
        .messages({
            "string.pattern.base": "PIN code must be exactly 6 digits"
        }),
    country: JOI.string().default("India")
});

const checkCustomerCustomerValidate = JOI.object({
    user_name: JOI.string().min(3).max(30).required(),

    user_email: JOI.string().email({ minDomainSegments: 2 }).required(),

    user_password: JOI.string().min(8).max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password must not exceed 30 characters",
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character"
        }),

    user_contact: JOI.string().pattern(/^[0-9]{10}$/).required()
        .messages({
            "string.pattern.base": "Contact must be a 10-digit number"
        }),

    user_role: JOI.string().valid("customer").default("customer"),

    user_address: addressSchema.required()
});

module.exports = checkCustomerCustomerValidate;