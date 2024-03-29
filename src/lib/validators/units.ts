import { body, param } from 'express-validator';
import { Request } from 'express';
import { int_validator, resource_exists, string_validator } from './validators.js';
import { Result, Option } from 'ts-results-es';
import * as Models from '../repositories/models.js';
import * as Units from '../repositories/units.js';
import * as Battles from '../repositories/battles.js';
import * as Honours from '../repositories/honours.js';
import { Award, Model, Unit } from '../types.js';
import { Errors } from '../errors.js';

export function unit_id_validator(
  value: number,
  {
    req,
    location,
    path
  }: { req: Request, location: any, path: any })
 {
   if (!req.user)
     return Promise.reject();
   return resource_exists<number, Unit>('unit')(Units.find_by_id(req.user))(value, { req, location, path });
 }


function name_validator() {
  return string_validator(body, 'name', 1, 64)
}

function member_validator() {
  return body('members')
    .isArray({ min: 1 })
    .withMessage('members must be an array of model ids.  A unit must have at least one member')
    .bail()
    .custom(async (value, {req, location, path }) => {
      if (!req.user)
        return Promise.reject();

      if (!req.resources)
        req.resources = {};
      const models = Result.all<Result<Option<Model>, string>[]>(...await Promise.all(value.map(Models.find_by_id(req.user))))
      if (models.isErr())
        return Promise.reject();

      if (models.value.find(m => m.isNone()))
        return Promise.reject();
      req.resources.members = models.value.map(m => m.unwrap());
    });
}

export function unit_honours_validator() {
  return body('honours')
    .isArray()
    .bail()
    .custom(value => value.every((h: {
      honour?: number,
      battle?: number,
      reason?: string
    }) => (h.honour && h.battle && h.reason)))
    .withMessage('Each honour most consist of: A honour id, a battle id, and a reason')
    .bail()
    .custom(async (value: {honour: number, battle: number, reason: string}[], {req, location, path}) => {
      if (!req.resources)
        req.resources = {};

      if (!req.user)
        return Promise.reject();

      const honours = await Promise.all(value.map(async (h): Promise<Award> => {
        const honour = await Honours.find_by_id(req.user)(h.honour);
        const battle = await Battles.find_by_id(req.user)(h.battle);

        if (honour.isErr() || honour.value.isNone())
          return Promise.reject('Invalid honour id');

        if (battle.isErr() || battle.value.isNone())
          return Promise.reject('Invalid battle id');

        return {
          honour: honour.value.value,
          battle: battle.value.value,
          reason: h.reason
        }
      }));
      req.resources.honours = honours;
    });
}

export function unit_honour_index_validator() {
  return int_validator(param, 'index', 1)
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const honours = req.resources?.unit?.honours;
      if (!honours)
        return Promise.reject(Errors.INTERNAL)
      if (honours.length < value)
        return Promise.reject(`index must be between 1 and ${honours.length}`);

      req.resources.index = value - 1;
      return Promise.resolve();
    })
}


function leader_validator() {
  return int_validator(body, 'leader', 1)
    .bail()
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const members = req.resources?.members || req.resources?.unit?.members;
    if (!members)
      return Promise.reject();

    const leader = members.find(m => m.id == value);
    if (!leader)
      return Promise.reject();
    req.resources.leader = leader;
    return Promise.resolve();
  }).withMessage('The leader of a unit must be a member of the unit')
}
export const new_unit_validator = [
  name_validator(),
  member_validator(),
  leader_validator(),
  unit_honours_validator(),
];

export const update_unit_validator = [
  name_validator().optional(),
  leader_validator().optional(),
];


export function existing_unit_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(unit_id_validator)
    .withMessage('Invalid unit id');
}
