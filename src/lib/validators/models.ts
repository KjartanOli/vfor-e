import { Request } from 'express';
import { body } from "express-validator";
import { int_validator, resource_exists, string_validator } from "./validators.js";
import { rank_id_check } from "./ranks.js";
import * as Models from '../repositories/models.js';
import { Model } from "../types.js";
import { Result } from "ts-results-es";

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

export function leader_id_validator(
  value: number,
  {
    req,
    location,
    path
  }: { req: Request, location: any, path: any })
 {
   if (!req.user)
     return Promise.reject();
   return resource_exists<number, Model>('leader')(Models.find_by_id(req.user))(value, { req, location, path });
 }

export const new_model_validator = [
  string_validator(body, 'name', 1),
  int_validator(body, 'rank', 1)
    .custom(rank_id_check),
  body('wargear').isArray(),
  body('honours').isArray()
];
