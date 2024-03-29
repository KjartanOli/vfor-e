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
  const { name } = matchedData(req);
  const user = req.user;

  if (!user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const { rank, wargear, honours } = req.resources;
  if (!rank || !wargear || !honours)
    return res.status(500).json({ error: Errors.INTERNAL });

  const model = await Models.add_model({name, rank, wargear, honours}, user);

  if (model.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(model.value);
}

export async function get_model(req: Request, res: Response) {
  const { model } = req.resources;

  if (!model)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(model);
}

export async function get_model_wargear(req: Request, res: Response) {
  const { model } = req.resources;

  if (!model)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(model.wargear);
}

export async function post_model_wargear(req: Request, res: Response) {
  const { model, wargear } = req.resources;

  if (!model || !wargear || !req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const updated = await Models.add_wargear(model, wargear, req.user);

  if (updated.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(updated.value);
}
