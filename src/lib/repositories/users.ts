import { Option, Some, None, Result, Err, Ok } from 'ts-results-es';
import { Argon2id } from 'oslo/password';
import { User } from '../types.js';
import { db } from '../../app.js';
import { PostgresError } from 'postgres';
import { Errors } from '../errors.js';

const argon = new Argon2id();

export async function find_by_id(id: number): Promise<Result<Option<User>, string>> {
  try {
    const [user]: [User?] = await db`
SELECT id, username, password
FROM e.users
WHERE id = ${id};
`
    if (!user)
      return Ok(None);

    return Ok(Some(user));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function find_by_username(username: string): Promise<Result<Option<User>, string>> {

  try {
  const [user]: [User?] = await db`
SELECT id, username, password
FROM e.users
WHERE username = ${username}`;
  if (!user)
    return Ok(None);

    return Ok(Some(user));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function compare_passwords(
  password: string,
  user: User
): Promise<boolean> {
  return argon.verify(user.password, password)
}

export async function create(user: Omit<User, 'id'>): Promise<Result<User, string>> {
  const hash = await argon.hash(user.password);

  try {
    const [new_user]: [User?] = await db`
INSERT INTO e.users(username, password)
VALUES (${user.username},${hash})
RETURNING id, username, password;
`;

    if (!new_user)
      return Err('Error inserting user');

    return Ok(new_user);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
