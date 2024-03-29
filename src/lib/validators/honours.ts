import { Request } from 'express';
import { body, param } from 'express-validator';
import { int_validator, resource_exists, string_validator } from './validators.js';
import * as Honours from '../repositories/honours.js';
import { BattleHonour } from '../types.js';

export const honour_id_check = (value: number, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<number, BattleHonour>('honour')(Honours.find_by_id(req.user))(value, { req, location, path });
}

const honour_name_check = (value: string, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<string, BattleHonour>('honour')(Honours.find_by_name(req.user))(value, { req, location, path });
}

export function existing_honour_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(honour_id_check)
    .withMessage('Invalid honour id');
}

export function honour_name_validator() {
    return string_validator(body, 'name', 1, 64);
}
export const new_honour_validator = [
  honour_name_validator()
    .not()
    .custom(honour_name_check),
  string_validator(body, 'description', 1),
]

export const update_honour_validator = new_honour_validator.map(v => v.optional());

export const existing_honour_validator = [
  honour_name_validator()
    .custom(honour_name_check)
];

