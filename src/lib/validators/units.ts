import { body } from 'express-validator';
import { int_validator, string_validator } from './validators.js';
import { leader_id_validator, model_id_validator } from './models.js'
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
  int_validator(body, 'leader', 1).bail().custom(leader_id_validator),
  member_validator(),
];
