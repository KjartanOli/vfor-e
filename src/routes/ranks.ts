import { Request, Response } from "express";
import { Errors } from "../lib/errors.js";
import * as Ranks from '../lib/repositories/ranks.js';
import { matchedData } from "express-validator";

export async function get_ranks(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const ranks = await Ranks.get_ranks(req.user);
  if (ranks.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(ranks.value);
}

export async function post_ranks(req: Request, res: Response) {
  const { name } = matchedData(req);

  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Ranks.add_rank(name, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.json(result.value);
}

export async function get_rank(req: Request, res: Response) {
  const { rank } = req.resources;

  if (!rank)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(rank);
}

export async function patch_rank(req: Request, res: Response) {
  const { name } = matchedData(req);
  const { rank } = req.resources;

  if (!rank)
    return res.status(500).json({ error: Errors.INTERNAL });

  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Ranks.update_rank({...rank, name}, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(result.value);
}
