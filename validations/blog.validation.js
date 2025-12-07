import Joi from "joi";

export const createBlogSchema = Joi.object({
  heading: Joi.string().min(3).max(200).required()
    .messages({
      "string.empty": "Heading is required",
      "string.min": "Heading must be at least 3 characters",
      "string.max": "Heading cannot exceed 200 characters",
    }),

  description: Joi.string().min(10).max(5000).required()
    .messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description cannot exceed 5000 characters",
    }),

  img: Joi.string().uri().required()
    .messages({
      "string.empty": "Image URL is required",
      "string.uri": "Please provide a valid image URL",
    }),
});

export const updateBlogSchema = Joi.object({
  heading: Joi.string().min(3).max(200)
    .messages({
      "string.min": "Heading must be at least 3 characters",
      "string.max": "Heading cannot exceed 200 characters",
    }),

  description: Joi.string().min(10).max(5000)
    .messages({
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description cannot exceed 5000 characters",
    }),

  img: Joi.string().uri()
    .messages({
      "string.uri": "Please provide a valid image URL",
    }),
}).min(1).messages({
  "object.min": "At least one field (heading, description, or img) must be provided",
});

