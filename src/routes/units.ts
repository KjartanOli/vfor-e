import { Request, Response } from "express";

import * as Units from '../lib/repositories/units.js';
import { Errors } from "../lib/errors.js";

export async function get_units(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const units = await Units.get_units(req.user);
  if (units.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(units.value);
}
