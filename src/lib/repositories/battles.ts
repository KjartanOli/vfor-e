import { Err, Result, Option, None, Ok, Some } from 'ts-results-es';
import { Battle, User } from '../types.js';
import { Errors } from '../errors.js';
import { db } from '../../app.js';

export async function get_battles(user: User): Promise<Result<Battle[], string>> {
  try {
    const battles = await db<Battle[]>`
SELECT id, name, location, description, date
FROM e.battles
WHERE user_id = ${user.id}`;

    if (!battles)
      return Err(Errors.DATABASE);
    return Ok(battles);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_battle(battle: Omit<Battle, 'id'>, user: User): Promise<Result<Battle, string>> {
  try {
    const [new_battle] = await db<[Battle?]>`
INSERT INTO e.battles(name, location, date, description, user_id)
VALUES (${battle.name}, ${battle.location}, ${battle.date}, ${battle.description}, ${user.id})
RETURNING id, name, location, date`;
    if (!new_battle)
      return Err(Errors.DATABASE);

    return Ok(new_battle);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export function find_by_id(user: User) {
  return async (id: number): Promise<Result<Option<Battle>, string>> => {
    try {
      const [battle] = await db<[Battle?]>`
SELECT id, name, location, date, description
FROM e.battles
WHERE id = ${id} AND user_id = ${user.id}`;
      if (!battle)
        return Ok(None);

      return Ok(Some(battle));
    } catch (e) {
      console.log(e);
      return Err(Errors.DATABASE);
    }
  }
}

export async function update_battle(battle: Battle, user: User): Promise<Result<Battle, string>> {
  try {
    const [updated] = await db<[Battle?]>`
UPDATE e.battles
SET
  name = ${battle.name},
  location = ${battle.location},
  date = ${battle.date},
  description = ${battle.description}
WHERE id = ${battle.id} AND user_id = ${user.id}
RETURNING id, name, location, date, description`;

    if (!updated)
      return Err(Errors.DATABASE);

    return Ok(updated);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
