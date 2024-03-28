import { Err, Result, Option, None, Ok, Some } from 'ts-results-es';
import { BattleHonour } from '../types';
import { Errors } from '../errors.js';
import { db } from '../../app.js';

export async function find_by_id(id: number): Promise<Result<Option<BattleHonour>, string>> {
  try {
    const [honour] = await db<[BattleHonour?]>`
SELECT id, name, description
FROM e.battle_honours
WHERE id = ${id}`;
    if (!honour)
      return Ok(None);

    return Ok(Some(honour));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
