import { Request, Response } from "express";
import { Errors } from "../lib/errors.js";
import * as Honours from '../lib/repositories/honours.js';
import { matchedData } from "express-validator";

export async function get_honours(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const honours = await Honours.get_honours(req.user);
  if (honours.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(honours.value);
}

export async function post_honours(req: Request, res: Response) {
  const { name, description } = matchedData(req);

  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Honours.add_honour({name, description }, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.json(result.value);
}

export async function get_honour(req: Request, res: Response) {
  const { honour } = req.resources;

  if (!honour)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(honour);
}

export async function patch_honour(req: Request, res: Response) {
  const { name, description } = matchedData(req);
  const { honour } = req.resources;

  if (!honour)
    return res.status(500).json({ error: Errors.INTERNAL });

  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Honours.update_honour({
    id: honour.id,
    name: name || honour.name,
    description: description || honour.description,
  }, req.user);

  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(result.value);
}

export async function delete_honour(req: Request, res: Response) {
  const { honour } = req.resources;

  if (!honour)
    return res.status(500).json({ error: Errors.INTERNAL });

  const result = await Honours.delete_honour(honour);
  if (result.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  return res.status(204).json();
}
