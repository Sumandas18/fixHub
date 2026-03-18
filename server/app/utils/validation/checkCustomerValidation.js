const Joi = require("joi");

const addressSchema = Joi.object({
    houseOrFlatNo: Joi.string().min(1).required(),
    buildingName: Joi.string().allow("", null),
    street: Joi.string().min(2).required(),
    area: Joi.string().min(2).required(),
    landmark: Joi.string().allow("", null),
    city: Joi.string().min(2).required(),
    district: Joi.string().allow("", null),
    state: Joi.string().min(2).required(),
    pinCode: Joi.string().pattern(/^[0-9]{6}$/).required()
        .messages({
            "string.pattern.base": "PIN code must be exactly 6 digits"
        }),
    country: Joi.string().default("India")
});

const checkCustomerValidate = Joi.object({
    user_name: Joi.string().min(3).max(30).required(),

    user_email: Joi.string().email({ minDomainSegments: 2 }).required(),

    user_password: Joi.string().min(8).max(30).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character"
        }),

    user_contact: Joi.string().pattern(/^[0-9]{10}$/).required()
        .messages({
            "string.pattern.base": "Contact must be a 10-digit number"
        }),

    user_address: addressSchema.required()
});

module.exports = checkCustomerValidate;