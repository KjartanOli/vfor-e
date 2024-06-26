import { Err, None, Ok, Result, Some, Option } from 'ts-results-es';
import { db } from '../../app.js';
import { Errors } from '../errors.js';
import { Award, Model, User, Wargear } from '../types';
import * as Ranks from './ranks.js';
import * as Honours from './honours.js';
import * as Battles from './battles.js';

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
    honours: await get_honours(skel.id, user),
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

export function find_by_id(user: User): (id: number) => Promise<Result<Option<Model>, string>> {
  return async (id: number): Promise<Result<Option<Model>, string>> => {
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
INSERT INTO e.model_wargear ${ db(model.wargear.map(w => (
  {
    model: result.id,
    wargear: w.id
  })), 'model', 'wargear')}`;

      if (!wargear)
        return Err(Errors.DATABASE);
    }
    if (model.honours.length > 0) {
      const honours = await db`
INSERT INTO e.model_battle_honours
${ db(model.honours.map(h => ({
  model: result.id,
  honour: h.honour.id,
  battle: h.battle.id,
  reason: h.reason
})))}`;

      if (!honours)
        return Err(Errors.DATABASE);

    }
    return Ok((await find_by_id(user)(result.id)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function delete_model(model: Model): Promise<Result<null, string>> {
  try {
    const result = await db`
DELETE FROM e.models
WHERE id = ${model.id}`;

    if (!result)
      return Err(Errors.DATABASE);
    return Ok(null);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function update_model(model: Model, user: User): Promise<Result<Model, string>> {
  try {
    const result = await db`
UPDATE e.models
SET name = ${model.name}, rank = ${model.rank.id}`;

    if (!result)
      return Err(Errors.DATABASE);
    return Ok((await find_by_id(user)(model.id)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_wargear(model: Model, wargear: Wargear[], user: User): Promise<Result<Model, string>> {
  try {
    const result = await db`
INSERT INTO e.model_wargear ${ db(wargear.map(w => (
  {
    model: model.id,
    wargear: w.id
  })))}`;
    if (!result)
      return Err(Errors.DATABASE);

    return Ok((await find_by_id(user)(model.id)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function leads(model: Model): Promise<Result<number[], string>> {
  try {
    const units = await db<{id: number}[]>`
SELECT id
FROM e.units
WHERE leader = ${model.id}`;

    return Ok(units.map(u => u.id));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function remove_wargear(model: Model, wargear: Wargear): Promise<Result<null, string>> {
  try {
    // In case of duplicate wargear items we don't actually care which
    // one gets removed, from the users perspective they are
    // identical, so as long as we only remove one everything is fine.
    const result = await db`
DELETE FROM e.model_wargear
WHERE id IN
(SELECT
  id
 FROM e.model_wargear
 WHERE model = ${model.id} AND wargear = ${wargear.id}
 LIMIT 1)`;

    if (!result)
      return Err(Errors.DATABASE);
    return Ok(null);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function remove_honour(model: Model, honour: Award): Promise<Result<null, string>> {
  try {
    const result = await db`
DELETE from e.model_battle_honours
WHERE
  model = ${model.id}
AND honour = ${honour.honour.id}
AND battle = ${honour.battle.id}
AND reason = ${honour.reason}`;

    if (!result)
      return Err(Errors.DATABASE);
    return Ok(null);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_honours(model: Model, honours: Award[], user: User): Promise<Result<Model, string>> {
  try {
    const result = await db`
INSERT INTO e.model_battle_honours
${ db(honours.map(h => ({
  model: model.id,
  honour: h.honour.id,
  battle: h.battle.id,
  reason: h.reason
})))}`;
    if (!result)
      return Err(Errors.DATABASE);

    return Ok((await find_by_id(user)(model.id)).unwrap().unwrap());
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

export async function get_honours(id: number, user: User): Promise<Award[]> {
  const honours = await db<{honour_id: number, battle_id: number, reason: string}[]>`
SELECT honour as honour_id, battle as battle_id, reason
FROM e.model_battle_honours
WHERE model = ${id}`;

  if (!honours)
    throw new Error(Errors.DATABASE);

  return Promise.all(honours.map(async (h): Promise<Award> => {
    const honour = await Honours.find_by_id(user)(h.honour_id);
    if (honour.isErr() || honour.value.isNone())
      throw new Error(Errors.DATABASE);

    const battle = await Battles.find_by_id(user)(h.battle_id);
    if (battle.isErr() || battle.value.isNone())
      throw new Error(Errors.DATABASE);

    return {
      honour: honour.value.value,
      battle: battle.value.value,
      reason: h.reason
    };
  }));
}
