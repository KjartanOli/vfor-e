import { Request, Response } from "express";

import * as Wargear from '../lib/repositories/wargear.js';
import { Errors } from "../lib/errors.js";
import { matchedData } from "express-validator";

export async function get_wargear(req: Request, res: Response) {
  const wargear = await Wargear.get_wargear();
  if (wargear.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(wargear.value);
}

export async function post_wargear(req: Request, res: Response) {
  const { name } = matchedData(req);

  const { type } = req.resources;

  if (!type)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Wargear.add(name, type);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.json(result.value);
}

export async function get_wargear_types(req: Request, res: Response) {
  const types = await Wargear.get_types();
  if (types.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(types.value);
}

export async function post_wargear_types(req: Request, res: Response) {
  const { name } = matchedData(req);

  const result = await Wargear.add_type(name);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.json(result.value);
}

export async function get_wargear_type(req: Request, res: Response) {
  const { type } = req.resources;

  if (!type)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(type);
}

export async function patch_wargear_type(req: Request, res: Response) {
  const { name } = matchedData(req);
  const { type } = req.resources;

  if (!type)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Wargear.update_type({...type, name});

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(result.value);
}
