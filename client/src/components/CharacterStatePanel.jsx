import { useState, useEffect } from 'react';
import { api } from '../api';
import './CharacterStatePanel.css';

export default function CharacterStatePanel({
  character,
  generalStates,
  mobilityEffects,
  combatEffects,
  cognitiveEffects,
  currentState,
  combatId,
  onUpdate,
}) {
  const [generalState, setGeneralState] = useState(currentState?.general_state ?? '');
  const [mobilityEffect, setMobilityEffect] = useState(currentState?.mobility_effect ?? '');
  const [combatEffect, setCombatEffect] = useState(currentState?.combat_effect ?? '');
  const [cognitiveEffect, setCognitiveEffect] = useState(currentState?.cognitive_effect ?? '');

  useEffect(() => {
    setGeneralState(currentState?.general_state ?? '');
    setMobilityEffect(currentState?.mobility_effect ?? '');
    setCombatEffect(currentState?.combat_effect ?? '');
    setCognitiveEffect(currentState?.cognitive_effect ?? '');
  }, [currentState]);

  const handleSave = async () => {
    if (currentState?.id) {
      await api.updateCharacterState(currentState.id, {
        general_state: generalState || null,
        mobility_effect: mobilityEffect || null,
        combat_effect: combatEffect || null,
        cognitive_effect: cognitiveEffect || null,
      });
    } else {
      await api.setCharacterState(combatId, {
        character_id: character.id,
        general_state: generalState || null,
        mobility_effect: mobilityEffect || null,
        combat_effect: combatEffect || null,
        cognitive_effect: cognitiveEffect || null,
      });
    }
    onUpdate();
  };

  return (
    <section className="character-state-panel card">
      <h2>État global – {character?.name}</h2>
      <p className="panel-desc">
        État général calculé à partir des blessures, douleur, saignement, infections et traumatismes.
      </p>
      <div className="state-grid">
        <div className="form-group">
          <label>État général du corps</label>
          <select
            value={generalState}
            onChange={(e) => setGeneralState(e.target.value)}
          >
            <option value="">—</option>
            {generalStates.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mobilité</label>
          <select
            value={mobilityEffect}
            onChange={(e) => setMobilityEffect(e.target.value)}
          >
            <option value="">—</option>
            {mobilityEffects.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Combat</label>
          <select
            value={combatEffect}
            onChange={(e) => setCombatEffect(e.target.value)}
          >
            <option value="">—</option>
            {combatEffects.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Cognitif</label>
          <select
            value={cognitiveEffect}
            onChange={(e) => setCognitiveEffect(e.target.value)}
          >
            <option value="">—</option>
            {cognitiveEffects.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" className="btn-primary" onClick={handleSave}>
        Enregistrer l'état
      </button>
    </section>
  );
}
