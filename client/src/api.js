// Par défaut : /api (proxy Vite vers le backend). Si VITE_API_URL est défini (ex: http://localhost:3002), appels directs.
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  getBodyParts: () => request('/body-parts'),
  getInjuryCategories: () => request('/injury-categories'),
  getInjuryTypes: (categoryId) => request(categoryId ? `/injury-types?category_id=${categoryId}` : '/injury-types'),
  getPhysiologicalStates: (category) => request(category ? `/physiological-states?category=${category}` : '/physiological-states'),
  getCareTypes: (category) => request(category ? `/care-types?category=${category}` : '/care-types'),

  getMj: () => request('/mj'),
  createMj: (name) => request('/mj', { method: 'POST', body: JSON.stringify({ name }) }),

  getPlayers: (mjId) => request(mjId ? `/players?mj_id=${mjId}` : '/players'),
  createPlayer: (mjId, name) => request('/players', { method: 'POST', body: JSON.stringify({ mj_id: mjId, name }) }),

  getCharacters: (playerId) => request(playerId ? `/characters?player_id=${playerId}` : '/characters'),
  createCharacter: (playerId, name) => request('/characters', { method: 'POST', body: JSON.stringify({ player_id: playerId, name }) }),

  getCombats: (mjId) => request(mjId ? `/combats?mj_id=${mjId}` : '/combats'),
  getCombat: (id) => request(`/combats/${id}`),
  createCombat: (mjId, name) => request('/combats', { method: 'POST', body: JSON.stringify({ mj_id: mjId, name }) }),
  updateCombat: (id, data) => request(`/combats/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getCombatInjuries: (combatId, characterId) => {
    const q = characterId ? `?character_id=${characterId}` : '';
    return request(`/combats/${combatId}/injuries${q}`);
  },
  addInjury: (combatId, data) => request(`/combats/${combatId}/injuries`, { method: 'POST', body: JSON.stringify(data) }),
  updateInjury: (id, data) => request(`/injuries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInjury: (id) => request(`/injuries/${id}`, { method: 'DELETE' }),

  getCharacterStates: (combatId, characterId) => {
    const q = characterId ? `?character_id=${characterId}` : '';
    return request(`/combats/${combatId}/character-states${q}`);
  },
  setCharacterState: (combatId, data) => request(`/combats/${combatId}/character-states`, { method: 'POST', body: JSON.stringify(data) }),
  updateCharacterState: (id, data) => request(`/character-states/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
