import { body, param } from "express-validator";
import { int_validator, resource_exists, string_validator } from './validators.js';
import { Request } from "express";
import * as Battles from '../repositories/battles.js';
import { Battle } from "../types.js";

export const battle_id_check = (value: number, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<number, Battle>('battle')(Battles.find_by_id(req.user))(value, { req, location, path });
}

function battle_name_validator() {
  return string_validator(body, 'name', 1, 64);
}

export function existing_battle_id_validator() {
  return int_validator(param, 'id', 1)
    .bail().custom(battle_id_check).withMessage('Invalid battle id')
}

export function delete_battle_validator() {
  return int_validator(param, 'id', 1)
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const { units, models } = await Battles.honours_for(value);

      if (units.length > 0)
        return Promise.reject(`Can not delete battle while units ${units} have battle honours from it`);

      if (models.length > 0)
        return Promise.reject(`Can not delete battle while models ${models} have battle honours from it`);

      return Promise.resolve();
    })
}

function battle_location_validator() {
  return string_validator(body, 'location', 1, 64);
}

function description_validator() {
  return string_validator(body, 'description', 1).optional()
}
export const new_battle_validator = [
  battle_name_validator(),
  body('date').isDate(),
  battle_location_validator(),
  description_validator(),
]

export const update_battle_validator = new_battle_validator.map(v => v.optional());
