import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || join(__dirname, '../../data/wound.db');

export const db = new Database(dbPath);

export function getBodyParts() {
  return db.prepare('SELECT * FROM body_parts ORDER BY sort_order').all();
}

export function getInjuryCategories() {
  return db.prepare('SELECT * FROM injury_categories ORDER BY sort_order').all();
}

export function getInjuryTypes(categoryId = null) {
  if (categoryId) {
    return db.prepare('SELECT * FROM injury_types WHERE category_id = ? ORDER BY sort_order').all(categoryId);
  }
  return db.prepare('SELECT * FROM injury_types ORDER BY category_id, sort_order').all();
}

export function getPhysiologicalStates(category = null) {
  if (category) {
    return db.prepare('SELECT * FROM physiological_states WHERE category = ? ORDER BY sort_order').all(category);
  }
  return db.prepare('SELECT * FROM physiological_states ORDER BY category, sort_order').all();
}

export function getCareTypes(category = null) {
  if (category) {
    return db.prepare('SELECT * FROM care_types WHERE category = ? ORDER BY sort_order').all(category);
  }
  return db.prepare('SELECT * FROM care_types ORDER BY category, sort_order').all();
}
