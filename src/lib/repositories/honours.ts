import { Err, Result, Option, None, Ok, Some } from 'ts-results-es';
import { BattleHonour, User } from '../types';
import { Errors } from '../errors.js';
import { db } from '../../app.js';

export async function get_honours(user: User): Promise<Result<BattleHonour[], string>> {
  try {
    const honours = await db<BattleHonour[]>`
SELECT id, name, description
FROM e.battle_honours
WHERE user_id = ${user.id}`;
    if (!honours)
      return Err(Errors.DATABASE);

    return Ok(honours);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_honour(honour: Omit<BattleHonour, 'id'>, user: User): Promise<Result<BattleHonour, string>> {
  try {
    const [new_honour] = await db<[BattleHonour?]>`
INSERT INTO e.battle_honours(name, description, user_id)
VALUES(${honour.name}, ${honour.description}, ${user.id})
RETURNING id, name, description`;
    if (!new_honour)
      return Err(Errors.DATABASE);

    return Ok(new_honour);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function delete_honour(honour: BattleHonour): Promise<Result<null, string>> {
  try {
    const result = await db`
DELETE FROM e.battle_honours
WHERE id = ${honour.id}`;

    if (!result)
      return Err(Errors.DATABASE);
    return Ok(null);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export function find_by_id(user: User): (id: number) => Promise<Result<Option<BattleHonour>, string>> {
  return async (id: number): Promise<Result<Option<BattleHonour>, string>> => {
    try {
      const [honour] = await db<[BattleHonour?]>`
SELECT id, name, description
FROM e.battle_honours
WHERE id = ${id} AND user_id = ${user.id}`;
      if (!honour)
        return Ok(None);

      return Ok(Some(honour));
    } catch (e) {
      console.log(e);
      return Err(Errors.DATABASE);
    }
  }
}

export function find_by_name(user: User): (name: string) => Promise<Result<Option<BattleHonour>, string>> {
  return async (name: string): Promise<Result<Option<BattleHonour>, string>> => {
    try {
      const [honour] = await db<[BattleHonour?]>`
SELECT id, name, description
FROM e.battle_honours
WHERE name = ${name} AND user_id = ${user.id}`;
      if (!honour)
        return Ok(None);

      return Ok(Some(honour));
    } catch (e) {
      console.log(e);
      return Err(Errors.DATABASE);
    }
  }
}

export async function update_honour(honour: BattleHonour, user: User): Promise<Result<BattleHonour, string>> {
  try {
    const [new_honour] = await db<[BattleHonour?]>`
UPDATE e.battle_honours
SET name = ${honour.name}, description = ${honour.description}
WHERE id = ${honour.id} AND user_id = ${user.id}
RETURNING id, name, description`;

    if (!new_honour)
      return Err(Errors.DATABASE);

    return Ok(new_honour);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
