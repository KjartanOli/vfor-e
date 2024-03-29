import { body } from 'express-validator';
import { Request } from 'express';
import { int_validator, string_validator } from './validators.js';
import { Result, Option } from 'ts-results-es';
import * as Models from '../repositories/models.js';
import { Model } from '../types.js';

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
export const new_unit_validator = [
  name_validator(),
  member_validator(),
  int_validator(body, 'leader', 1).bail().custom(async (value: number, {req, location, path}: {req: Request, location: any, path: any}) => {
    if (!req.resources?.members)
      return Promise.reject();

    const leader = req.resources.members.find(m => m.id == value);
    if (!leader)
      return Promise.reject();
    req.resources.leader = leader;
    return Promise.resolve();
  }).withMessage('The leader of a unit must be a member of the unit'),
];
