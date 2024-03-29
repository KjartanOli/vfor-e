import { Request } from 'express';
import { body, param } from 'express-validator';
import { int_validator, resource_exists, string_validator } from './validators.js';
import * as Ranks from '../repositories/ranks.js';
import { Rank } from '../types.js';

const rank_name_check = (value: string, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<string, Rank>('rank')(Ranks.find_by_name(req.user))(value, { req, location, path });
}

export const rank_id_check = (value: number, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<number, Rank>('rank')(Ranks.find_by_id(req.user))(value, { req, location, path });
}

export function existing_rank_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(rank_id_check)
    .withMessage('Invalid rank id');
}

export function delete_rank_validator() {
  return int_validator(param, 'id', 1)
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const models = await Ranks.holders_of(value);

      if (models.length > 0)
        return Promise.reject(`Can not delete rank while models ${models} hold it`);

      return Promise.resolve();
    });
}


export function rank_name_validator() {
    return string_validator(body, 'name', 1, 64);
}
export const new_rank_validator = [
  rank_name_validator()
    .not()
    .custom(rank_name_check)
]

export const existing_rank_validator = [
  rank_name_validator()
    .custom(rank_name_check)
];
