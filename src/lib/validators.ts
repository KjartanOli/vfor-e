import { CustomValidator, body, param, validationResult } from "express-validator";
import { User, Wargear, WargearType } from "./types";
import { Request, Response, NextFunction } from "express";
import { Result, Option } from "ts-results-es";
import * as Users from './users.js';
import * as W from './wargear.js';
import passport from "passport";
import { ErrorMessage } from "express-validator/src/base";

function int_validator(location: Function, field: string, min: number, max: number | null = null) {
  return location(field)
    .isInt(max ? { min, max} : { min })
    .withMessage(max
      ? `${field} must be a number between ${min} and ${max}`
      : `${field} must be a number greater than ${min}`);
}

function string_validator(location: Function, field: string, min: number, max: number | null = null) {
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

export const existing_user_validator = [
  string_validator(body, 'username', 1, 30)
    .custom(resource_exists<string, User>('user')(Users.find_by_username)),
  string_validator(body, 'password', 1)
];

export const new_user_validator = [
  string_validator(body, 'username', 1, 30)
    .not()
    .custom(resource_exists<string, User>('user')(Users.find_by_username)),
  string_validator(body, 'password', 1)
];

export function wargear_type_name_validator() {
  return string_validator(body, 'name', 1, 20)
}

export const new_wargear_type_validator = [
  wargear_type_name_validator()
    .not()
    .custom(resource_exists<string, WargearType>('name')(W.find_type)),
];

export const existing_wargear_type_name_validator = [
  wargear_type_name_validator()
    .custom(resource_exists<string, WargearType>('type')(W.find_type))
];

export function existing_wargear_type_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(resource_exists<number, WargearType>('type')(W.find_type_by_id))
    .withMessage('Invalid type id');
}

export const new_wargear_validator = [
  string_validator(body, 'name', 1, 30)
    .not()
    .custom(resource_exists<string, Wargear>('wargear')(W.find_by_name)),
  int_validator(body, 'type', 1)
    .bail()
    .custom(resource_exists<number, WargearType>('type')(W.find_type_by_id))
    .withMessage('Invalid type id')
];

export async function ensure_authenticated(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate(
    'jwt',
    { session: false },
    // TODO: Find correct types for err and info
    (err: any, user: User, info: any) => {
      if (err)
        return next(err);
      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    })(req, res, next);
}

export async function ensure_admin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.admin)
    return res.status(401).json({ error: 'Insufficient permissions' });

  next();
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

function resource_exists<Identifier,Value>(resource_location: string) {
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
