import { db } from '../../app.js';
import { BattleHonour, Wargear } from '../types';

export async function get_wargear(id: number): Promise<Wargear[]> {
  return db<Wargear[]>`
SELECT w.id, w.name, t.name
FROM e.wargear w
INNER JOIN e.wargear_types t ON w.type = t.id
INNER JOIN e.model_wargear m ON w.id = m.wargear
WHERE m.model = ${id}`;
}

export async function get_honours(id: number): Promise<BattleHonour[]> {
  return [];
}
