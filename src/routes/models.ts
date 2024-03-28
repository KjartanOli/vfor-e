import { Request, Response } from "express";
import { Errors } from "../lib/errors.js";
import * as Models from '../lib/repositories/models.js';
import { matchedData } from "express-validator";

export async function get_models(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const models = await Models.get_models(req.user);
  if (models.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(models.value);
}

export async function post_models(req: Request, res: Response) {
  const { name, wargear = [], honours = [] } = matchedData(req);
  const user = req.user;

  if (!user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const { rank } = req.resources;
  if (!rank)
    return res.status(500).json({ error: Errors.INTERNAL });

  Models.add_model({name, rank, wargear, honours}, user);

}
