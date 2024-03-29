import { Err, Ok, Result, Option, Some, None } from 'ts-results-es';
import { db } from '../../app.js';
import { Wargear, WargearType } from '../types.js';
import { Errors } from '../errors.js';

// TODO: Make wargear user specific
export async function get_wargear(): Promise<Result<Wargear[], string>> {
  try {
    const wargear = await db<Wargear[]>`
SELECT w.id, w.name, t.name
FROM e.wargear w
INNER JOIN e.wargear_types t ON w.type = t.id`;

    if (!wargear)
      return Err(Errors.DATABASE);

    return Ok(wargear);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function find_by_id(id: number): Promise<Result<Option<Wargear>, string>> {
  try {
    const [wargear]: [{id: number, name: string, type_id: number, type: string}?] = await db`
SELECT w.id as id, w.name as name, t.name as type, t.id as type_id
FROM e.wargear w
INNER JOIN e.wargear_types t ON w.type = t.id
WHERE w.id = ${id}`;

    if (!wargear)
      return Ok(None);

    return Ok(Some({
      id: wargear.id,
      name: wargear.name,
      type: {
        id: wargear.type_id,
        name: wargear.type
      }
    }));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}


export async function find_by_name(name: string): Promise<Result<Option<Wargear>, string>> {
  try {
    const [wargear]: [{id: number, name: string, type_id: number, type: string}?] = await db`
SELECT w.id as id, w.name as name, t.name as type, t.id as type_id
FROM e.wargear w
INNER JOIN e.wargear_types t ON w.type = t.id
WHERE w.name = ${name}`;

    if (!wargear)
      return Ok(None);

    return Ok(Some({
      id: wargear.id,
      name: wargear.name,
      type: {
        id: wargear.type_id,
        name: wargear.type
      }
    }));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add(name: string, type: WargearType): Promise<Result<Wargear, string>> {
  try {
    const [wargear]: [Omit<Wargear, 'type'>] = await db`
INSERT into e.wargear(name, type)
VALUES (${name}, ${type.id})
RETURNING id, name`;

    if (!wargear)
      return Err(Errors.DATABASE);

    return Ok({...wargear, type});
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function get_types(): Promise<Result<WargearType[], string>> {
  try {
    const types = await db<WargearType[]>`
SELECT id, name
FROM e.wargear_types t`;

    if (!types)
      return Err(Errors.DATABASE);

    return Ok(types);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function find_type(name: string): Promise<Result<Option<WargearType>, string>> {
  try {
    const [type]: [WargearType?] = await db`
SELECT id, name
FROM e.wargear_types t
WHERE t.name = ${name}`;

    if (!type)
      return Ok(None);

    return Ok(Some(type));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function find_type_by_id(id: number): Promise<Result<Option<WargearType>, string>> {
  try {
    const [type]: [WargearType?] = await db`
SELECT id, name
FROM e.wargear_types t
WHERE t.id = ${id}`;

    if (!type)
      return Ok(None);

    return Ok(Some(type));
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function add_type(name: string): Promise<Result<WargearType, string>> {
  try {
    const [type]: [WargearType?] = await db`
INSERT into e.wargear_types(name)
VALUES (${name})
RETURNING id, name`;

    if (!type)
      return Err(Errors.DATABASE);

    return Ok(type);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}

export async function update_type(type: WargearType): Promise<Result<WargearType, string>> {
  try {
    const [updated]: [WargearType?] = await db`
UPDATE e.wargear_types
SET name = ${type.name}
WHERE id = ${type.id}
RETURNING id, name`;

    if (!updated)
      return Err(Errors.DATABASE);

    return Ok(updated);
  } catch (e) {
    console.log(e);
    return Err(Errors.DATABASE);
  }
}
