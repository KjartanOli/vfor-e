import { Request, Response } from "express";
import { Errors } from "../lib/errors.js";
import * as Battles from '../lib/repositories/battles.js';
import { matchedData } from "express-validator";

export async function get_battles(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const battles = await Battles.get_battles(req.user);
  if (battles.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(battles.value);
}

export async function post_battles(req: Request, res: Response) {
  const { name, date, location, description = null } = matchedData(req);
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const battle = await Battles.add_battle({name, date, location, description }, req.user);
  if (battle.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });
  res.json(battle.value);
}

export async function patch_battle(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({ error: Errors.INTERNAL });

  const { name, date, location, description = null } = matchedData(req);

  const { battle } = req.resources;
  if (!battle)
    return res.status(500).json({ error: Errors.INTERNAL });

  const updated = await Battles.update_battle({
    id: battle.id,
    name: name || battle.name,
    date: date || battle.date,
    location: location || battle.location,
    description: description || battle.description
  }, req.user);

  if (updated.isErr())
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(updated.value);
}

export async function get_battle(req: Request, res: Response) {
  const { battle } = req.resources;

  if (!battle)
    return res.status(500).json({ error: Errors.INTERNAL });

  res.json(battle);
}
