import { Request, Response } from "express";

import * as Units from '../lib/repositories/units.js';
import { Errors } from "../lib/errors.js";
import { matchedData } from "express-validator";

export async function get_units(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const units = await Units.get_units(req.user);
  if (units.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(units.value);
}

export async function get_unit(req: Request, res: Response) {
  const { unit } = req.resources;

  if (!unit)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(unit);
}

export async function get_unit_honours(req: Request, res: Response) {
  const { unit } = req.resources;

  if (!unit)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(unit.honours);
}

export async function get_unit_indexed_honour(req: Request, res: Response) {
  const { unit, index } = req.resources;

  if (!unit || (!index && index !== 0))
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(unit.honours[index]);
}

export async function delete_unit_honour(req: Request, res: Response) {
  const { unit, index } = req.resources;

  if (!unit || (!index && index !== 0))
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Units.remove_honour(unit, unit.honours[index]);
  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.status(204).json();
}

export async function post_unit_honours(req: Request, res: Response) {
  const { unit, honours } = req.resources;

  if (!unit || !honours || !req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const updated = await Units.add_honours(unit, honours, req.user);

  if (updated.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(updated.value);
}

export async function post_units(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const { name, honours = [] } = matchedData(req);
  const { leader, members } = req.resources;
  if (!leader || !members)
    return res.status(500).json({ error: Errors.INTERNAL });

  const unit = await Units.add_unit({name, leader, members, honours}, req.user);
  if (unit.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(unit.value);
}
