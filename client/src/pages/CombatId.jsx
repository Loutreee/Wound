import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import BodySilhouette from '../components/BodySilhouette';
import CharacterCard from '../components/CharacterCard';
import InjuryForm from '../components/InjuryForm';
import CharacterStatePanel from '../components/CharacterStatePanel';
import {
  GENERAL_STATES,
  MOBILITY_EFFECTS,
  COMBAT_EFFECTS,
  COGNITIVE_EFFECTS,
} from '../constants';
import './CombatId.css';

export default function CombatId() {
  const { combatId } = useParams();
  const [bodyParts, setBodyParts] = useState([]);
  const [injuryCategories, setInjuryCategories] = useState([]);
  const [injuryTypes, setInjuryTypes] = useState([]);
  const [physStates, setPhysStates] = useState([]);
  const [careTypes, setCareTypes] = useState([]);
  const [combat, setCombat] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [allInjuries, setAllInjuries] = useState([]);
  const [allCharacterStates, setAllCharacterStates] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);

  const loadRef = async () => {
    const [bp, cat, types, phys, care] = await Promise.all([
      api.getBodyParts(),
      api.getInjuryCategories(),
      api.getInjuryTypes(),
      api.getPhysiologicalStates(),
      api.getCareTypes(),
    ]);
    setBodyParts(bp);
    setInjuryCategories(cat);
    setInjuryTypes(types);
    setPhysStates(phys);
    setCareTypes(care);
  };

  const loadCombatAndCharacters = async () => {
    if (!combatId) return;
    const combatData = await api.getCombat(combatId);
    setCombat(combatData);
    const players = await api.getPlayers(combatData.mj_id);
    const charsByPlayer = await Promise.all(
      players.map((p) => api.getCharacters(p.id))
    );
    setCharacters(charsByPlayer.flat());
  };

  const loadInjuriesAndStates = async () => {
    if (!combatId) return;
    const [injuries, states] = await Promise.all([
      api.getCombatInjuries(combatId),
      api.getCharacterStates(combatId),
    ]);
    setAllInjuries(injuries);
    setAllCharacterStates(states);
  };

  useEffect(() => { loadRef(); }, []);
  useEffect(() => { loadCombatAndCharacters(); }, [combatId]);
  useEffect(() => { loadInjuriesAndStates(); }, [combatId]);

  const injuriesByCharacter = useMemo(() => {
    const byChar = {};
    allInjuries.forEach((i) => {
      const cid = i.character_id;
      if (!byChar[cid]) byChar[cid] = [];
      byChar[cid].push(i);
    });
    return byChar;
  }, [allInjuries]);

  const statesByCharacter = useMemo(() => {
    const byChar = {};
    allCharacterStates.forEach((s) => {
      byChar[s.character_id] = s;
    });
    return byChar;
  }, [allCharacterStates]);

  const injuriesForSelected = selectedCharacter
    ? injuriesByCharacter[selectedCharacter.id] || []
    : [];

  const currentState = selectedCharacter
    ? statesByCharacter[selectedCharacter.id]
    : null;

  const handleAddInjury = async (data) => {
    if (!selectedCharacter) return;
    await api.addInjury(combatId, {
      character_id: selectedCharacter.id,
      body_part_id: selectedPartId || data.body_part_id,
      injury_type_id: data.injury_type_id,
      physiological_pain: data.physiological_pain,
      physiological_bleeding: data.physiological_bleeding,
      physiological_infection: data.physiological_infection,
      care_applied: data.care_applied,
      sensation: data.sensation,
      visual_effect: data.visual_effect,
      notes: data.notes,
    });
    loadInjuriesAndStates();
  };

  const handleSaveCombat = async () => {
    await api.updateCombat(combatId, { saved_at: new Date().toISOString() });
    loadCombatAndCharacters();
  };

  const handleSelectCharacter = (char) => {
    setSelectedCharacter(char);
    setSelectedPartId(null);
  };

  return (
    <div className="combat-id">
      <header className="combat-id-header">
        <h1>Combat #{combatId}{combat?.name ? ` – ${combat.name}` : ''}</h1>
        <button type="button" className="btn-primary" onClick={handleSaveCombat}>
          Sauvegarder le combat
        </button>
      </header>

      <div className="combat-id-layout">
        <section className="combat-id-cards card">
          <h2>Personnages</h2>
          <p className="combat-id-cards-hint">Cliquez sur un personnage pour afficher et modifier ses blessures.</p>
          {characters.length === 0 ? (
            <p className="text-muted">Aucun personnage. Créez des joueurs et des personnages depuis l’accueil.</p>
          ) : (
            <div className="combat-id-cards-grid">
              {characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  injuries={injuriesByCharacter[char.id] || []}
                  bodyParts={bodyParts}
                  generalStateLabel={
                    GENERAL_STATES.find(
                      (s) => s.id === statesByCharacter[char.id]?.general_state
                    )?.label
                  }
                  selected={selectedCharacter?.id === char.id}
                  onClick={handleSelectCharacter}
                />
              ))}
            </div>
          )}
        </section>

        <section className="combat-id-detail">
          {selectedCharacter ? (
            <>
              <div className="combat-id-detail-header card">
                <h2>{selectedCharacter.name}</h2>
              </div>
              <div className="combat-id-grid">
                <section className="combat-id-silhouette card">
                  <h3>Corps</h3>
                  <BodySilhouette
                    bodyParts={bodyParts}
                    injuries={injuriesForSelected}
                    selectedPartId={selectedPartId}
                    onSelectPart={setSelectedPartId}
                  />
                  <p className="combat-id-hint">Cliquez sur une zone pour ajouter une blessure.</p>
                </section>

                <section className="combat-id-form card">
                  <h3>
                    {selectedPartId
                      ? `Blessure – ${bodyParts.find((p) => p.id === selectedPartId)?.label_fr ?? selectedPartId}`
                      : 'Ajouter une blessure'}
                  </h3>
                  <InjuryForm
                    bodyParts={bodyParts}
                    injuryCategories={injuryCategories}
                    injuryTypes={injuryTypes}
                    physStates={physStates}
                    careTypes={careTypes}
                    selectedPartId={selectedPartId}
                    onSubmit={handleAddInjury}
                  />
                </section>
              </div>

              <CharacterStatePanel
                character={selectedCharacter}
                generalStates={GENERAL_STATES}
                mobilityEffects={MOBILITY_EFFECTS}
                combatEffects={COMBAT_EFFECTS}
                cognitiveEffects={COGNITIVE_EFFECTS}
                currentState={currentState}
                combatId={combatId}
                onUpdate={loadInjuriesAndStates}
              />

              <section className="combat-id-injuries card">
                <h3>Historique des blessures</h3>
                {injuriesForSelected.length === 0 ? (
                  <p className="text-muted">Aucune blessure enregistrée.</p>
                ) : (
                  <ul className="injury-list">
                    {injuriesForSelected.map((i) => (
                      <li key={i.id}>
                        <strong>{i.body_part_label}</strong> – {i.injury_type_label || '—'}
                        {i.notes && <span className="injury-notes"> {i.notes}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <div className="combat-id-detail-empty card">
              <p>Sélectionnez un personnage dans la liste à gauche pour afficher et modifier ses blessures et son état.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
