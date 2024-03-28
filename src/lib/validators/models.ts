import { body } from "express-validator";
import { int_validator, string_validator } from "./validators.js";
import { existing_rank_id_validator, rank_id_check } from "./ranks.js";

export const new_model_validator = [
  string_validator(body, 'name', 1),
  int_validator(body, 'rank', 1)
    .custom(rank_id_check),
  body('wargear').isArray(),
  body('honours').isArray()
];
