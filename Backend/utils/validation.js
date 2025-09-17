import Joi from "joi";
import { ApiError } from "./apiError.js";

export const nrrCalculationSchema = Joi.object({
  yourTeam: Joi.string()
    .valid('CSK', 'RCB', 'DC', 'RR', 'MI')
    .required()
    .messages({
      'any.required': 'Your team is required',
      'any.only': 'Invalid team name. Must be one of: CSK, RCB, DC, RR, MI'
    }),

  oppositionTeam: Joi.string()
    .valid('CSK', 'RCB', 'DC', 'RR', 'MI')
    .required()
    .messages({
      'any.required': 'Opposition team is required',
      'any.only': 'Invalid opposition team name. Must be one of: CSK, RCB, DC, RR, MI'
    }),

  overs: Joi.alternatives()
    .try(
      Joi.number().min(1).max(50),
      Joi.string().pattern(/^\d{1,2}(\.\d{1,2})?$/)
    )
    .required()
    .messages({
      'any.required': 'Number of overs is required',
      'number.min': 'Overs must be at least 1',
      'number.max': 'Overs cannot exceed 50',
      'string.pattern.base': 'Invalid overs format. Use format like "20" or "20.3"'
    }),

  desiredPosition: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'any.required': 'Desired position is required',
      'number.base': 'Desired position must be a number',
      'number.integer': 'Desired position must be an integer',
      'number.min': 'Desired position must be at least 1',
      'number.max': 'Desired position cannot exceed 5'
    }),

  tossResult: Joi.string()
    .valid('batting_first', 'bowling_first')
    .required()
    .messages({
      'any.required': 'Toss result is required',
      'any.only': 'Toss result must be either "batting_first" or "bowling_first"'
    }),

  runsScored: Joi.when('tossResult', {
    is: 'batting_first',
    then: Joi.number()
      .integer()
      .min(0)
      .max(500)
      .required()
      .messages({
        'any.required': 'Runs scored is required when batting first',
        'number.base': 'Runs scored must be a number',
        'number.integer': 'Runs scored must be an integer',
        'number.min': 'Runs scored cannot be negative',
        'number.max': 'Runs scored cannot exceed 500'
      }),
    otherwise: Joi.forbidden()
  }),

  runsToChase: Joi.when('tossResult', {
    is: 'bowling_first',
    then: Joi.number()
      .integer()
      .min(0)
      .max(500)
      .required()
      .messages({
        'any.required': 'Runs to chase is required when bowling first',
        'number.base': 'Runs to chase must be a number',
        'number.integer': 'Runs to chase must be an integer',
        'number.min': 'Runs to chase cannot be negative',
        'number.max': 'Runs to chase cannot exceed 500'
      }),
    otherwise: Joi.forbidden()
  })
});

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      const validationError = new ApiError(400, `Validation error: ${errorMessages}`);
      return res.status(400).json(validationError);
    }

    req.body = value;
    next();
  };
};