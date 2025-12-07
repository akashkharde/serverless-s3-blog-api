import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),

  email: Joi.string().email().required()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string().min(6).max(128).required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required()    
  .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string().max(128).required()
      .messages({
      "string.empty": "Password is required",
    }),
});
