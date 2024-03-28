import { body, param } from "express-validator";
import { Wargear, WargearType } from "../types";
import { int_validator, resource_exists, string_validator } from "./validators.js";
import * as W from '../wargear.js';

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
