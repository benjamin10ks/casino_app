import { NotFoundError } from "../utils/errors.js";

export function notFound(req, res, next) {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
}
