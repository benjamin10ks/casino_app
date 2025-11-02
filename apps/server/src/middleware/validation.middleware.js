import { ValidationError } from "../errors/validation.error.js";

export function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      return next(new ValidationError("Invalid request data", errors));
    }

    req.body = value;
    next();
  };
}
