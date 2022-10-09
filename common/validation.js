const Joi = require('joi');

const signupValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(3)
            .required(),
        lastName: Joi.string()
            .min(3)
            .required(),
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string()
            .min(8)
            .max(24)
            .required(),
    });

    return schema.validate(data);
};

const signInValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string()
            .min(8)
            .max(24)
            .required()
    });

    return schema.validate(data);
};

module.exports = { 
    signupValidation, 
    signInValidation 
};