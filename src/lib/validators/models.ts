import { Request } from 'express';
import { body, param } from "express-validator";
import { int_validator, resource_exists, string_validator } from "./validators.js";
import { rank_id_check } from "./ranks.js";
import * as Models from '../repositories/models.js';
import * as W from '../repositories/wargear.js';
import * as Battles from '../repositories/battles.js';
import * as Honours from '../repositories/honours.js';
import { Award, Model, Wargear } from "../types.js";
import { Result, Option } from 'ts-results-es';
import { Errors } from '../errors.js';

export function model_id_validator(
  value: number,
  {
    req,
    location,
    path
  }: { req: Request, location: any, path: any })
 {
   if (!req.user)
     return Promise.reject();
   return resource_exists<number, Model>('model')(Models.find_by_id(req.user))(value, { req, location, path });
 }

export function model_wargear_validator() {
  return body('wargear')
    .isArray()
    .bail()
    .custom(async (value, {req, location, path}) => {
      if (!req.resources)
        req.resources = {};

      if (!req.user)
        return Promise.reject();
      const wargear = Result.all<Result<Option<Wargear>, string>[]>(...await Promise.all(value.map(W.find_by_id(req.user))))
      if (wargear.isErr())
        return Promise.reject();

      if (wargear.value.find(w => w.isNone()))
        return Promise.reject();
      req.resources.wargear = wargear.value.map(w => w.unwrap());
    })
}

export function model_wargear_index_validator() {
  return int_validator(param, 'index', 1)
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const wargear = req.resources?.model?.wargear;
      if (!wargear)
        return Promise.reject(Errors.INTERNAL)
      if (wargear.length < value)
        return Promise.reject(`index must be between 1 and ${wargear.length}`);

      req.resources.index = value - 1;
      return Promise.resolve();
    })
}

export function model_honour_index_validator() {
  return int_validator(param, 'index', 1)
    .custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
      const honours = req.resources?.model?.honours;
      if (!honours)
        return Promise.reject(Errors.INTERNAL)
      if (honours.length < value)
        return Promise.reject(`index must be between 1 and ${honours.length}`);

      req.resources.index = value - 1;
      return Promise.resolve();
    })
}

export function model_honours_validator() {
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

export const new_model_validator = [
  string_validator(body, 'name', 1),
  int_validator(body, 'rank', 1)
    .custom(rank_id_check),
  model_wargear_validator(),
  model_honours_validator(),
];

export function existing_model_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(model_id_validator)
    .withMessage('Invalid model id');
}
