import { Err, None, Ok, Result, Some, Option } from 'ts-results-es';
import { db } from '../../app.js';
import { Errors } from '../errors.js';
import { Rank, User } from '../types.js';

export async function get_ranks(user: User): Promise<Result<Rank[], string>> {
  try {
    const ranks = await db<Rank[]>`
SELECT id, name
 FROM e.ranks
 WHERE user_id = ${user.id}`;

    if (!ranks)
      return Err(Errors.DATABASE);

    return Ok(ranks);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_rank(name: string, user: User): Promise<Result<Rank, string>> {
  try {
    const [rank] = await db<[Rank?]>`
INSERT INTO e.ranks(user_id, name)
VALUES (${user.id}, ${name})
RETURNING id, name`;

    if (!rank)
      return Err(Errors.DATABASE);
    return Ok(rank);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function update_rank(rank: Rank, user: User): Promise<Result<Rank, string>> {
  try {
    const [new_rank] = await db<[Rank?]>`
UPDATE e.ranks
SET name = ${rank.name}
WHERE id = ${rank.id} AND user_id = ${user.id}
RETURNING id, name`;

    if (!new_rank)
      return Err(Errors.DATABASE);

    return Ok(new_rank);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export function find_by_name(user: User): (name: string) => Promise<Result<Option<Rank>, string>> {
  return async (name: string): Promise<Result<Option<Rank>, string>> => {
    try {
      const [rank] = await db<[Rank?]>`
SELECT id, name
FROM e.ranks
WHERE user_id = ${user.id} AND name = ${name}`;
      if (!rank)
        return Ok(None);

      return Ok(Some(rank));
    } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
  }
}

export function find_by_id(user: User): (id: number) => Promise<Result<Option<Rank>, string>> {
  return async (id: number): Promise<Result<Option<Rank>, string>> => {
    try {
      const [rank] = await db<[Rank?]>`
SELECT id, name
FROM e.ranks
WHERE user_id = ${user.id} AND id = ${id}`;
      if (!rank)
        return Ok(None);

      return Ok(Some(rank));
    } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
  }
}
