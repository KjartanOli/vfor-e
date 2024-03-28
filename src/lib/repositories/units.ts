import { User, Unit, Model } from '../types';
import { db } from '../../app.js';
import { Err, Ok, Result } from 'ts-results-es';
import { Errors } from '../errors.js';
import * as Models from './models.js';

export async function get_units(user: User): Promise<Result<Unit[], string>> {
  try {
    let units = await db<{ id: number, leader_id: number, name: string }[]>`
SELECT id, leader as leader_id, name
FROM units
WHERE user_id = ${user.id}`;
    if (!units)
      return Err(Errors.DATABASE);

    await Promise.all(units.map(async unit => {
      const models = await get_models(unit.id);
    }));

    return Err('not implemented');

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
