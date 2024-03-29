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

export async function post_units(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const { name, honours = [] } = matchedData(req);
  const { leader, members } = req.resources;
  if (!leader || !members)
    return res.status(500).json({ error: Errors.INTERNAL });

  const unit = await Units.add_unit({name, leader, members, honours});
  if (unit.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(unit.value);
}
