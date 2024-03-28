import { body } from "express-validator";
import { resource_exists, string_validator } from "./validators.js";
import { User } from "../types";
import * as Users from '../users.js';
import passport from "passport";
import { Request, Response, NextFunction } from "express";

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
