import { Request } from 'express';
import { body, param } from "express-validator";
import { Wargear, WargearType } from "../types";
import { int_validator, resource_exists, string_validator } from "./validators.js";
import * as W from '../repositories/wargear.js';

export function wargear_type_name_validator() {
  return string_validator(body, 'name', 1, 20)
}

const type_name_check = (value: string, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<string, WargearType>('type')(W.find_type(req.user))(value, { req, location, path });
}

export const type_id_check = (value: number, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<number, WargearType>('type')(W.find_type_by_id(req.user))(value, { req, location, path });
}

const wargear_name_check = (value: string, { req, location, path }: { req: Request, location: any, path: any }) => {
  if (!req.user)
    return Promise.reject();
  return resource_exists<string, Wargear>('wargear')(W.find_by_name(req.user))(value, { req, location, path });
}

export const new_wargear_type_validator = [
  wargear_type_name_validator()
    .not()
    .custom(type_name_check),
];

export const existing_wargear_type_name_validator = [
  wargear_type_name_validator()
    .custom(type_name_check)
];

export function existing_wargear_type_id_validator() {
  return int_validator(param, 'id', 1)
    .bail()
    .custom(type_id_check)
    .withMessage('Invalid type id');
}

export const new_wargear_validator = [
  string_validator(body, 'name', 1, 30)
    .not()
    .custom(wargear_name_check),
  int_validator(body, 'type', 1)
    .bail()
    .custom(type_id_check)
    .withMessage('Invalid type id')
];
