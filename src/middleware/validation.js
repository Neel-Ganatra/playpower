import Joi from "joi";

// Validation schemas
const schemas = {
  login: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
  }),

  createQuiz: Joi.object({
    grade: Joi.string().min(1).max(10).required(),
    subject: Joi.string().min(2).max(50).required(),
    questionCount: Joi.number().integer().min(1).max(20).default(5),
  }),

  submitQuiz: Joi.object({
    answers: Joi.array()
      .items(Joi.number().integer().min(0).max(3))
      .min(1)
      .max(20)
      .required(),
  }),

  getHint: Joi.object({
    userAnswer: Joi.number().integer().min(0).max(3).allow(null).optional(),
  }),

  sendEmail: Joi.object({
    submissionId: Joi.number().integer().positive().required(),
    email: Joi.string().email().required(),
  }),

  leaderboard: Joi.object({
    grade: Joi.string().min(1).max(10).required(),
    subject: Joi.string().min(2).max(50).required(),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  quizHistory: Joi.object({
    grade: Joi.string().min(1).max(10).optional(),
    subject: Joi.string().min(2).max(50).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().min(Joi.ref("fromDate")).optional(),
  }),

  analytics: Joi.object({
    subject: Joi.string().min(2).max(50).optional(),
  }),
};

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errorDetails,
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware factory
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        error: "Query validation failed",
        details: errorDetails,
      });
    }

    req.query = value;
    next();
  };
};

// Parameter validation middleware
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        error: "Parameter validation failed",
        details: errorDetails,
      });
    }

    req.params = value;
    next();
  };
};

// Export schemas for use in routes
export { schemas };
