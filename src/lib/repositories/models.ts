import { Err, None, Ok, Result, Some, Option } from 'ts-results-es';
import { db } from '../../app.js';
import { Errors } from '../errors.js';
import { Award, Model, User, Wargear } from '../types';
import * as Ranks from './ranks.js';

interface ModelSkeleton {
  id: number;
  name: string;
  rank_id: number;
};

function inflate(user: User): (skel: ModelSkeleton) => Promise<Model> {
  return async (skel: ModelSkeleton) => ({
      id: skel.id,
      name: skel.name,
      rank: (await Ranks.find_by_id(user)(skel.rank_id)).unwrap().unwrap(),
      wargear: await get_wargear(skel.id),
      honours: await get_honours(skel.id),
  });
}

export async function get_models(user: User): Promise<Result<Model[], string>> {
  try {

    const results = await db<ModelSkeleton[]>`
SELECT id, name, rank as rank_id
FROM e.models m
WHERE m.user_id = ${user.id}`;

    if (!results)
      return Err(Errors.DATABASE);

    return Ok(await Promise.all(results.map(inflate(user))));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function get_model(id: number, user: User): Promise<Result<Option<Model>, string>> {
  try {
    const [skel] = await db<[ModelSkeleton?]>`
SELECT id, rank as rank_id, name
FROM e.models
WHERE id = ${id} AND user_id = ${user.id}`;

    if (!skel)
      return Ok(None);

    return Ok(Some(await inflate(user)(skel)));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_model(model: Omit<Model, 'id'>, user: User): Promise<Result<Model, string>> {
  try {
    const [result] = await db<[{id: number}?]>`
INSERT INTO e.models(name, rank, user_id)
VALUES (${model.name}, ${model.rank.id}, ${user.id})
RETURNING id`;

    if (!result)
      return Err(Errors.DATABASE);

    if (model.wargear.length > 0) {
      const wargear = await db`
INSERT INTO e.model_wargear(model, wargear)
VALUES (${ db(model.wargear.map(w => ({ model: result, wargear: w.id })), 'model', 'wargear')})`;

      if (!wargear)
        return Err(Errors.DATABASE);
    }
    if (model.honours.length > 0) {
      const honours = await db`
INSERT INTO e.model_battle_honours(model, honour, battle, reason)
VALUES ${ db(model.honours.map(h => ({
  model: result,
  honour: h.honour.id,
  battle: h.battle.id,
  reason: h.reason
})))}`;

      if (!honours)
        return Err(Errors.DATABASE);

    }
    return Ok((await get_model(result.id, user)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function get_wargear(id: number): Promise<Wargear[]> {
  return (await db<{id: number, name: string, type_id: number, type: string}[]>`
SELECT w.id as id, w.name as name, t.id as type_id, t.name as type
FROM e.wargear w
INNER JOIN e.wargear_types t ON w.type = t.id
INNER JOIN e.model_wargear m ON w.id = m.wargear
WHERE m.model = ${id}`).map(w => ({
  id: w.id,
  name: w.name,
  type: {
    id: w.type_id,
    name: w.type
  }
}));
}

export async function get_honours(id: number): Promise<Award[]> {
  return [];
}
