import { CustomValidator, body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { Result, Option } from "ts-results-es";

export function int_validator(location: Function, field: string, min: number, max: number | null = null) {
  return location(field)
    .isInt(max ? { min, max} : { min })
    .withMessage(max
      ? `${field} must be a number between ${min} and ${max}`
      : `${field} must be a number greater than ${min}`);
}

export function string_validator(location: Function, field: string, min: number, max: number | null = null) {
  return location(field)
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .isLength(max ? { min, max} : { min })
    .withMessage(max
      ? `${field} must be between ${min} and ${max} characters`
      : `${field} must be at least ${min} characters`);
}

export function check_validation(req: Request, res: Response, next: NextFunction) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const not_found_error = validation.array().find((error) => error.msg === 'not found');
    const server_error = validation.array().find((error) => error.msg === 'server error');
    const login_error = validation.array().find((error) => error.msg === 'username or password incorrect');

    let status = 400;

    if (server_error) {
      status = 500;
    } else if (not_found_error) {
      status = 404;
    } else if (login_error) {
      status = 401;
    }

    return res.status(status).json({ errors: validation.array() });
  }

  return next();
}

/**
 * Checks if resource exists by running a lookup function for that resource. If
 * the resource exists, the function should return the resource, it'll be added
 * to the request object under `resources[resource_location]`.
 */

export function resource_exists<Identifier,Value>(resource_location: string) {
  return (fn: (value: Identifier) => Promise<Result<Option<Value>, string>>): CustomValidator => {
    return (value: Identifier, { req, location, path }) => fn(value)
      .then((result) => {
        if (result.isErr())
          return Promise.reject(new Error(result.error));
        if (result.value.isNone())
          return Promise.reject(new Error('not found'));

        if (!req.resources)
          req.resources = {};
        req.resources[resource_location] = result.value.value;
        return Promise.resolve();
      })
      .catch((error) => {
        if (error.message === 'not found') {
          // This we just handled
          return Promise.reject(error);
        }

        // This is something we did *not* handle, treat as 500 error
        console.log(error);
        return Promise.reject(new Error('server error'));
      });
  }
}
