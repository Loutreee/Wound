import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import supertest from 'supertest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app;

test.before(async () => {
  process.env.DB_PATH = path.join(__dirname, 'wound.test.db');
  await import('../src/db/init.js');
  const appMod = await import('../src/app.js');
  app = appMod.default;
});

test('GET /api/body-parts retourne un tableau', async () => {
  const res = await supertest(app).get('/api/body-parts');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 10);
  assert.ok(res.body.some((p) => p.id === 'head' && p.label_fr === 'Tête'));
});

test('GET /api/injury-categories retourne les catégories', async () => {
  const res = await supertest(app).get('/api/injury-categories');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test('GET /api/mj retourne un tableau', async () => {
  const res = await supertest(app).get('/api/mj');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('POST /api/mj crée un MJ', async () => {
  const res = await supertest(app)
    .post('/api/mj')
    .send({ name: 'MJ Test' })
    .set('Content-Type', 'application/json');
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.id);
  assert.strictEqual(res.body.name, 'MJ Test');
});

test('POST /api/combats crée un combat', async () => {
  const mjRes = await supertest(app).post('/api/mj').send({ name: 'MJ Combat' });
  const mjId = mjRes.body.id;
  const res = await supertest(app)
    .post('/api/combats')
    .send({ mj_id: mjId, name: 'Combat 1' })
    .set('Content-Type', 'application/json');
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.id);
  assert.strictEqual(res.body.mj_id, mjId);
});

test('GET /api/combats/:id/injuries retourne un tableau', async () => {
  const mjRes = await supertest(app).post('/api/mj').send({ name: 'MJ Inj' });
  const combatRes = await supertest(app)
    .post('/api/combats')
    .send({ mj_id: mjRes.body.id });
  const res = await supertest(app).get(`/api/combats/${combatRes.body.id}/injuries`);
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});
