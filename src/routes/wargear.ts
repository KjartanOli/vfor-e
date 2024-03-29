import { Request, Response } from "express";

import * as Wargear from '../lib/repositories/wargear.js';
import { Errors } from "../lib/errors.js";
import { matchedData } from "express-validator";

export async function get_wargear(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const wargear = await Wargear.get_wargear(req.user);
  if (wargear.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(wargear.value);
}

export async function post_wargear(req: Request, res: Response) {
  const { name } = matchedData(req);

  const { type } = req.resources;

  if (!type || !req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Wargear.add(name, type, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.json(result.value);
}

export async function get_wargear_types(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const types = await Wargear.get_types(req.user);
  if (types.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(types.value);
}

export async function post_wargear_types(req: Request, res: Response) {
  const { name } = matchedData(req);

  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Wargear.add_type(name, req.user);

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

  if (!type || !req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Wargear.update_type({...type, name}, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(result.value);
}
