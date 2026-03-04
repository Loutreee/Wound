import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getBodyParts,
  getInjuryCategories,
  getInjuryTypes,
  getPhysiologicalStates,
  getCareTypes,
  db,
} from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const clientDist = path.join(__dirname, '../../client/dist');

app.use(cors());
app.use(express.json());

app.get('/api/body-parts', (_, res) => {
  try {
    res.json(getBodyParts());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/injury-categories', (_, res) => {
  try {
    res.json(getInjuryCategories());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/injury-types', (req, res) => {
  try {
    const types = getInjuryTypes(req.query.category_id || null);
    res.json(types);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/physiological-states', (req, res) => {
  try {
    const states = getPhysiologicalStates(req.query.category || null);
    res.json(states);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/care-types', (req, res) => {
  try {
    const types = getCareTypes(req.query.category || null);
    res.json(types);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/mj', (_, res) => {
  try {
    const rows = db.prepare('SELECT * FROM mj_accounts ORDER BY id').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/mj', (req, res) => {
  try {
    const { name } = req.body;
    const r = db.prepare('INSERT INTO mj_accounts (name) VALUES (?)').run(name || 'MJ');
    res.status(201).json({ id: r.lastInsertRowid, name: name || 'MJ' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/players', (req, res) => {
  try {
    const mjId = req.query.mj_id;
    const sql = mjId
      ? 'SELECT * FROM players WHERE mj_id = ? ORDER BY id'
      : 'SELECT * FROM players ORDER BY id';
    const rows = mjId ? db.prepare(sql).all(mjId) : db.prepare(sql).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/players', (req, res) => {
  try {
    const { mj_id, name } = req.body;
    const r = db.prepare('INSERT INTO players (mj_id, name) VALUES (?, ?)').run(mj_id, name);
    res.status(201).json({ id: r.lastInsertRowid, mj_id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/characters', (req, res) => {
  try {
    const playerId = req.query.player_id;
    const sql = playerId
      ? 'SELECT * FROM characters WHERE player_id = ? ORDER BY id'
      : 'SELECT * FROM characters ORDER BY id';
    const rows = playerId ? db.prepare(sql).all(playerId) : db.prepare(sql).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/characters', (req, res) => {
  try {
    const { player_id, name } = req.body;
    const r = db.prepare('INSERT INTO characters (player_id, name) VALUES (?, ?)').run(player_id, name);
    res.status(201).json({ id: r.lastInsertRowid, player_id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/combats', (req, res) => {
  try {
    const mjId = req.query.mj_id;
    const sql = mjId
      ? 'SELECT * FROM combats WHERE mj_id = ? ORDER BY id DESC'
      : 'SELECT * FROM combats ORDER BY id DESC';
    const rows = mjId ? db.prepare(sql).all(mjId) : db.prepare(sql).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/combats/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM combats WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Combat non trouvé' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/combats', (req, res) => {
  try {
    const { mj_id, name } = req.body;
    const r = db.prepare('INSERT INTO combats (mj_id, name) VALUES (?, ?)').run(mj_id, name || null);
    res.status(201).json({ id: r.lastInsertRowid, mj_id, name: name || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/combats/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, saved_at } = req.body;
    db.prepare(
      'UPDATE combats SET name = COALESCE(?, name), saved_at = COALESCE(?, saved_at) WHERE id = ?'
    ).run(name ?? null, saved_at ?? null, id);
    const row = db.prepare('SELECT * FROM combats WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Combat non trouvé' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/combats/:combatId/injuries', (req, res) => {
  try {
    const { combatId } = req.params;
    const characterId = req.query.character_id;
    let sql = `
      SELECT ci.*, it.label_fr AS injury_type_label, bp.label_fr AS body_part_label
      FROM character_injuries ci
      LEFT JOIN injury_types it ON it.id = ci.injury_type_id
      LEFT JOIN body_parts bp ON bp.id = ci.body_part_id
      WHERE ci.combat_id = ?
    `;
    const params = [combatId];
    if (characterId) {
      sql += ' AND ci.character_id = ?';
      params.push(characterId);
    }
    sql += ' ORDER BY ci.created_at DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/combats/:combatId/injuries', (req, res) => {
  try {
    const { combatId } = req.params;
    const {
      character_id,
      body_part_id,
      injury_type_id,
      physiological_pain,
      physiological_bleeding,
      physiological_infection,
      care_applied,
      sensation,
      visual_effect,
      notes,
    } = req.body;
    const r = db
      .prepare(
        `INSERT INTO character_injuries (
          combat_id, character_id, body_part_id, injury_type_id,
          physiological_pain, physiological_bleeding, physiological_infection,
          care_applied, sensation, visual_effect, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        combatId,
        character_id,
        body_part_id,
        injury_type_id || null,
        physiological_pain || null,
        physiological_bleeding || null,
        physiological_infection || null,
        care_applied || null,
        sensation || null,
        visual_effect || null,
        notes || null
      );
    const row = db.prepare('SELECT * FROM character_injuries WHERE id = ?').get(r.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/injuries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const fields = [
      'body_part_id', 'injury_type_id', 'physiological_pain', 'physiological_bleeding',
      'physiological_infection', 'care_applied', 'sensation', 'visual_effect', 'notes',
    ];
    const updates = [];
    const values = [];
    for (const f of fields) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    }
    if (updates.length) {
      values.push(id);
      db.prepare(`UPDATE character_injuries SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    const row = db.prepare('SELECT * FROM character_injuries WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Blessure non trouvée' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/injuries/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM character_injuries WHERE id = ?').run(id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/combats/:combatId/character-states', (req, res) => {
  try {
    const { combatId } = req.params;
    const characterId = req.query.character_id;
    let sql = 'SELECT * FROM character_states WHERE combat_id = ?';
    const params = [combatId];
    if (characterId) {
      sql += ' AND character_id = ?';
      params.push(characterId);
    }
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/combats/:combatId/character-states', (req, res) => {
  try {
    const { combatId } = req.params;
    const { character_id, general_state, mobility_effect, combat_effect, cognitive_effect } = req.body;
    const r = db
      .prepare(
        `INSERT INTO character_states (combat_id, character_id, general_state, mobility_effect, combat_effect, cognitive_effect)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        combatId,
        character_id,
        general_state || null,
        mobility_effect || null,
        combat_effect || null,
        cognitive_effect || null
      );
    const row = db.prepare('SELECT * FROM character_states WHERE id = ?').get(r.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/character-states/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { general_state, mobility_effect, combat_effect, cognitive_effect } = req.body;
    db.prepare(
      `UPDATE character_states SET
        general_state = COALESCE(?, general_state),
        mobility_effect = COALESCE(?, mobility_effect),
        combat_effect = COALESCE(?, combat_effect),
        cognitive_effect = COALESCE(?, cognitive_effect),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      general_state ?? null,
      mobility_effect ?? null,
      combat_effect ?? null,
      cognitive_effect ?? null,
      id
    );
    const row = db.prepare('SELECT * FROM character_states WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'État non trouvé' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

export default app;
