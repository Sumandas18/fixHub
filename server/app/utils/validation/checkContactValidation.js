const Joi = require('joi');

const checkContactValidation = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name must not exceed 100 characters'
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required'
        }),

    subject: Joi.string()
        .trim()
        .min(3)
        .max(150)
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 3 characters',
            'string.max': 'Subject must not exceed 150 characters'
        }),

    message: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 10 characters',
            'string.max': 'Message must not exceed 2000 characters'
        })
});

module.exports = checkContactValidation;