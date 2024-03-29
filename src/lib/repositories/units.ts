import { User, Unit, Model, BattleHonour, Award } from '../types';
import { db } from '../../app.js';
import { Err, None, Ok, Result, Some, Option } from 'ts-results-es';
import { Errors } from '../errors.js';
import * as Models from './models.js';
import * as Honours from './honours.js';
import * as Battles from './battles.js';

interface UnitSkeleton {
  id: number;
  leader_id: number;
  name: string;
};

function inflate(user: User) {
  return async (unit: UnitSkeleton): Promise<Unit> => {
    const models = await get_models(unit.id, user);
    if (models.isErr())
      throw new Error(Errors.DATABASE);

    const leader = models.value.find(model => model.id === unit.leader_id);
    if (!leader)
      throw new Error(Errors.INTERNAL);

    const honours = await get_honours(unit.id, user);
    if (honours.isErr())
      throw new Error(Errors.INTERNAL);

    return {
      id: unit.id,
      name: unit.name,
      members: models.value,
      leader,
      honours: honours.value
    };
  }
}

export async function get_units(user: User): Promise<Result<Unit[], string>> {
  try {
    const results = await db<UnitSkeleton[]>`
SELECT id, leader as leader_id, name
FROM e.units
WHERE user_id = ${user.id}`;
    if (!results)
      return Err(Errors.DATABASE);

    const units = await Promise.all(results.map(inflate(user)));

    return Ok(units);

  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export function find_by_id(user: User): (id: number) => Promise<Result<Option<Unit>, string>> {
  return async (id: number): Promise<Result<Option<Unit>, string>> => {
    try {
      const [skel] = await db<[UnitSkeleton?]>`
SELECT id, leader as leader_id, name
FROM e.units
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

export async function add_unit(unit: Omit<Unit, 'id'>, honours: Award[], user: User): Promise<Result<Unit, string>> {
  try {
    const [res] = await db<[{id: number}?]>`
INSERT INTO e.units(name, leader, user_id)
VALUES (${unit.name}, ${unit.leader.id}, ${user.id})
RETURNING id;`;

    if (!res)
      return Err(Errors.DATABASE);

    if (!await db`
INSERT INTO e.unit_models
${ db(unit.members.map(m => ({
   unit: res.id,
   model: m.id
 })))}`)
      return Err(Errors.DATABASE);

    if (unit.honours.length > 0)
      if (!await db`
INSERT INTO e.unit_battle_honours
${ db(honours.map(h => ({
  unit: res.id,
  honour: h.honour.id,
  battle: h.battle.id,
  reason: h.reason
})))}`)
        return Err(Errors.DATABASE);

    return Ok({
      id: res.id,
      ...unit,
      honours: (await get_honours(res.id, user)).unwrap()
    });
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

async function get_models(id: number, user: User): Promise<Result<Model[], string>> {
  try {
    const models = await db<{id: number, name: string, rank: string, rank_id: number}[]>`
SELECT m.id as id, m.name as name, r.name as rank, r.id as rank_id
FROM e.models m
INNER JOIN e.ranks r ON m.rank = r.id
INNER JOIN e.unit_models u ON u.model = m.id
WHERE u.unit = ${id}`;

    return Ok(await Promise.all(models.map(async model => ({
      id: model.id,
      name: model.name,
      rank: {
        id: model.rank_id,
        name: model.rank
      },
      wargear: await Models.get_wargear(model.id),
      honours: await Models.get_honours(model.id, user)
    }))));

  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
async function get_honours(id: number, user: User): Promise<Result<Award[], string>> {
  try {
    const honours = await db<{honour_id: number, battle_id: number, reason: string}[]>`
SELECT honour as honour_id, battle as battle_id, reason
FROM e.unit_battle_honours
WHERE unit = ${id}`;

    if (!honours)
      return Err(Errors.DATABASE);

    return Ok(await Promise.all(honours.map(async (h): Promise<Award> => {
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
    })));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function remove_honour(unit: Unit, honour: Award): Promise<Result<null, string>> {
  try {
    const result = await db`
DELETE from e.unit_battle_honours
WHERE
  unit = ${unit.id}
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

export async function add_honours(unit: Unit, honours: Award[], user: User): Promise<Result<Unit, string>> {
  try {
    const result = await db`
INSERT INTO e.unit_battle_honours
${ db(honours.map(h => ({
  unit: unit.id,
  honour: h.honour.id,
  battle: h.battle.id,
  reason: h.reason
})))}`;
    if (!result)
      return Err(Errors.DATABASE);

    return Ok((await find_by_id(user)(unit.id)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function update_unit(unit: Unit, user: User): Promise<Result<Unit, string>> {
  try {
    const result = await db`
UPDATE e.units
SET name = ${unit.name}, leader = ${unit.leader.id}
WHERE id = ${unit.id}`;

    if (!result)
      return Err(Errors.DATABASE);

    return Ok((await find_by_id(user)(unit.id)).unwrap().unwrap());
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
