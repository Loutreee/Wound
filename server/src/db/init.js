import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DB_PATH ? dirname(process.env.DB_PATH) : join(__dirname, '../../data');
const dbPath = process.env.DB_PATH || join(dataDir, 'wound.db');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
const db = new Database(dbPath);

// Schéma
db.exec(`
  CREATE TABLE IF NOT EXISTS mj_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mj_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (mj_id) REFERENCES mj_accounts(id)
  );

  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS combats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mj_id INTEGER NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    saved_at TEXT,
    FOREIGN KEY (mj_id) REFERENCES mj_accounts(id)
  );

  CREATE TABLE IF NOT EXISTS body_parts (
    id TEXT PRIMARY KEY,
    label_fr TEXT NOT NULL,
    sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS injury_categories (
    id TEXT PRIMARY KEY,
    label_fr TEXT NOT NULL,
    sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS injury_types (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    label_fr TEXT NOT NULL,
    severity INTEGER DEFAULT 1,
    sort_order INTEGER,
    FOREIGN KEY (category_id) REFERENCES injury_categories(id)
  );

  CREATE TABLE IF NOT EXISTS physiological_states (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    label_fr TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS care_types (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    label_fr TEXT NOT NULL,
    sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS character_injuries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combat_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    body_part_id TEXT NOT NULL,
    injury_type_id TEXT,
    physiological_pain TEXT,
    physiological_bleeding TEXT,
    physiological_infection TEXT,
    care_applied TEXT,
    sensation TEXT,
    visual_effect TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (combat_id) REFERENCES combats(id),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id),
    FOREIGN KEY (injury_type_id) REFERENCES injury_types(id)
  );

  CREATE TABLE IF NOT EXISTS character_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combat_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    general_state TEXT,
    mobility_effect TEXT,
    combat_effect TEXT,
    cognitive_effect TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (combat_id) REFERENCES combats(id),
    FOREIGN KEY (character_id) REFERENCES characters(id)
  );
`);

// Données de référence : parties du corps
const bodyParts = [
  { id: 'head', label_fr: 'Tête', sort_order: 1 },
  { id: 'torso', label_fr: 'Torse', sort_order: 2 },
  { id: 'arm_left', label_fr: 'Bras gauche', sort_order: 3 },
  { id: 'arm_right', label_fr: 'Bras droit', sort_order: 4 },
  { id: 'forearm_left', label_fr: 'Avant-bras gauche', sort_order: 5 },
  { id: 'forearm_right', label_fr: 'Avant-bras droit', sort_order: 6 },
  { id: 'hand_left', label_fr: 'Main gauche', sort_order: 7 },
  { id: 'hand_right', label_fr: 'Main droite', sort_order: 8 },
  { id: 'leg_left', label_fr: 'Jambe gauche', sort_order: 9 },
  { id: 'leg_right', label_fr: 'Jambe droite', sort_order: 10 },
  { id: 'foot_left', label_fr: 'Pied gauche', sort_order: 11 },
  { id: 'foot_right', label_fr: 'Pied droit', sort_order: 12 },
];

const bodyStmt = db.prepare(`
  INSERT OR IGNORE INTO body_parts (id, label_fr, sort_order) VALUES (?, ?, ?)
`);
bodyParts.forEach(({ id, label_fr, sort_order }) => bodyStmt.run(id, label_fr, sort_order));

// Catégories et types de blessures
const injuryData = [
  { category: 'cutting', categoryLabel: 'Coupures / armes tranchantes', types: ['Égratignure', 'Entaille', 'Coupure profonde', 'Lacération', 'Section de muscle', 'Section de tendon'] },
  { category: 'piercing', categoryLabel: 'Perforations / armes pointues', types: ['Piqûre', 'Plaie perforante', 'Perforation profonde', 'Perforation d\'organe', 'Empalement'] },
  { category: 'blunt', categoryLabel: 'Contondant / impact', types: ['Contusion', 'Hématome', 'Fissure osseuse', 'Fracture', 'Fracture ouverte', 'Écrasement'] },
  { category: 'projectile', categoryLabel: 'Projectiles', types: ['Impact superficiel', 'Plaie pénétrante', 'Traversée du membre', 'Impact critique', 'Destruction de tissu'] },
  { category: 'burn_fire', categoryLabel: 'Brûlures (feu)', types: ['Irritation', 'Brûlure légère', 'Brûlure moyenne', 'Brûlure grave', 'Brûlure critique'] },
  { category: 'burn_chemical', categoryLabel: 'Chimique / poison', types: ['Irritation chimique', 'Brûlure chimique', 'Nécrose des tissus'] },
  { category: 'joint', categoryLabel: 'Traumatismes articulaires', types: ['Entorse', 'Luxation', 'Déchirure ligamentaire', 'Rupture ligamentaire'] },
  { category: 'internal', categoryLabel: 'Traumatismes internes', types: ['Douleur interne', 'Hémorragie interne', 'Organe perforé', 'Traumatisme interne critique'] },
];

const catStmt = db.prepare(`
  INSERT OR IGNORE INTO injury_categories (id, label_fr, sort_order) VALUES (?, ?, ?)
`);
const typeStmt = db.prepare(`
  INSERT OR IGNORE INTO injury_types (id, category_id, label_fr, severity, sort_order) VALUES (?, ?, ?, ?, ?)
`);
injuryData.forEach(({ category, categoryLabel, types }, ci) => {
  catStmt.run(category, categoryLabel, ci + 1);
  types.forEach((label, ti) => {
    const id = `${category}_${ti + 1}`;
    typeStmt.run(id, category, label, ti + 1, ti + 1);
  });
});

// États physiologiques
const physStates = [
  { category: 'pain', labels: ['Légèrement douloureux', 'Douloureux', 'Très douloureux', 'Extrêmement douloureux'] },
  { category: 'bleeding', labels: ['Saignement léger', 'Saignement modéré', 'Saignement important', 'Hémorragie', 'Hémorragie massive'] },
  { category: 'infection', labels: ['Plaie propre', 'Risque d\'infection', 'Infection', 'Infection grave', 'Gangrène'] },
];
const physStmt = db.prepare(`
  INSERT OR IGNORE INTO physiological_states (id, category, label_fr, level, sort_order) VALUES (?, ?, ?, ?, ?)
`);
physStates.forEach(({ category, labels }) => {
  labels.forEach((label_fr, i) => {
    physStmt.run(`${category}_${i + 1}`, category, label_fr, i + 1, i + 1);
  });
});

// Soins
const careData = [
  { category: 'simple', labels: ['Nettoyage', 'Désinfection', 'Bandage', 'Pansement'] },
  { category: 'medical', labels: ['Suture', 'Attelle', 'Immobilisation', 'Cautérisation', 'Drainage'] },
  { category: 'stabilization', labels: ['Compression', 'Garrot', 'Immobilisation complète'] },
];
const careStmt = db.prepare(`
  INSERT OR IGNORE INTO care_types (id, category, label_fr, sort_order) VALUES (?, ?, ?, ?)
`);
careData.forEach(({ category, labels }) => {
  labels.forEach((label_fr, i) => {
    careStmt.run(`${category}_${i + 1}`, category, label_fr, i + 1);
  });
});

console.log('Base de données initialisée :', dbPath);
db.close();
