import { User, Unit, Model, BattleHonour, Award } from '../types';
import { db } from '../../app.js';
import { Err, Ok, Result } from 'ts-results-es';
import { Errors } from '../errors.js';
import * as Models from './models.js';
import * as Honours from './honours.js';
import * as Battles from './battles.js';

export async function get_units(user: User): Promise<Result<Unit[], string>> {
  try {
    const results = await db<{ id: number, leader_id: number, name: string }[]>`
SELECT id, leader as leader_id, name
FROM e.units
WHERE user_id = ${user.id}`;
    if (!results)
      return Err(Errors.DATABASE);

    const units = await Promise.all(results.map(async (unit): Promise<Unit> => {
      const models = await get_models(unit.id);
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
    }));

    return Ok(units);

  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

async function get_models(id: number): Promise<Result<Model[], string>> {
  try {
    const models = await db<Omit<Model, 'wargear'>[]>`
SELECT m.id, m.name, r.name
FROM e.models m
INNER JOIN e.ranks r ON m.rank = r.id
WHERE m.id = ${id}`;

    return Ok(await Promise.all(models.map(async model => ({
      ...model,
      wargear: await Models.get_wargear(model.id),
      honours: await Models.get_honours(model.id)
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
      const honour = await Honours.find_by_id(h.honour_id);
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

