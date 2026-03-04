import { useState, useEffect } from 'react';
import { VISUAL_EFFECTS, SENSATIONS } from '../constants';
import './InjuryForm.css';

export default function InjuryForm({
  bodyParts,
  injuryCategories,
  injuryTypes,
  physStates,
  careTypes,
  selectedPartId,
  onSubmit,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [bodyPartId, setBodyPartId] = useState(selectedPartId || '');
  const [injuryTypeId, setInjuryTypeId] = useState('');
  const [physPain, setPhysPain] = useState('');
  const [physBleeding, setPhysBleeding] = useState('');
  const [physInfection, setPhysInfection] = useState('');
  const [careApplied, setCareApplied] = useState('');
  const [sensation, setSensation] = useState('');
  const [visualEffect, setVisualEffect] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setBodyPartId(selectedPartId || '');
  }, [selectedPartId]);

  const typesInCategory = injuryTypes.filter((t) => t.category_id === categoryId);
  const painStates = physStates.filter((p) => p.category === 'pain');
  const bleedingStates = physStates.filter((p) => p.category === 'bleeding');
  const infectionStates = physStates.filter((p) => p.category === 'infection');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      body_part_id: bodyPartId,
      injury_type_id: injuryTypeId || null,
      physiological_pain: physPain || null,
      physiological_bleeding: physBleeding || null,
      physiological_infection: physInfection || null,
      care_applied: careApplied || null,
      sensation: sensation || null,
      visual_effect: visualEffect || null,
      notes: notes.trim() || null,
    });
    setInjuryTypeId('');
    setPhysPain('');
    setPhysBleeding('');
    setPhysInfection('');
    setCareApplied('');
    setSensation('');
    setVisualEffect('');
    setNotes('');
  };

  return (
    <form className="injury-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Partie du corps</label>
        <select
          value={bodyPartId}
          onChange={(e) => setBodyPartId(e.target.value)}
          required
        >
          <option value="">— Choisir —</option>
          {bodyParts.map((p) => (
            <option key={p.id} value={p.id}>{p.label_fr}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Type de blessure (catégorie)</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setInjuryTypeId('');
          }}
        >
          <option value="">— Choisir —</option>
          {injuryCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.label_fr}</option>
          ))}
        </select>
      </div>

      {categoryId && (
        <div className="form-group">
          <label>Type de blessure</label>
          <select
            value={injuryTypeId}
            onChange={(e) => setInjuryTypeId(e.target.value)}
          >
            <option value="">— Choisir —</option>
            {typesInCategory.map((t) => (
              <option key={t.id} value={t.id}>{t.label_fr}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Douleur</label>
          <select value={physPain} onChange={(e) => setPhysPain(e.target.value)}>
            <option value="">—</option>
            {painStates.map((p) => (
              <option key={p.id} value={p.id}>{p.label_fr}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Saignement</label>
          <select value={physBleeding} onChange={(e) => setPhysBleeding(e.target.value)}>
            <option value="">—</option>
            {bleedingStates.map((p) => (
              <option key={p.id} value={p.id}>{p.label_fr}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Infection</label>
          <select value={physInfection} onChange={(e) => setPhysInfection(e.target.value)}>
            <option value="">—</option>
            {infectionStates.map((p) => (
              <option key={p.id} value={p.id}>{p.label_fr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Soins appliqués</label>
        <select value={careApplied} onChange={(e) => setCareApplied(e.target.value)}>
          <option value="">—</option>
          {careTypes.map((c) => (
            <option key={c.id} value={c.id}>{c.label_fr}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Sensation</label>
          <select value={sensation} onChange={(e) => setSensation(e.target.value)}>
            <option value="">—</option>
            {SENSATIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Effet visuel</label>
          <select value={visualEffect} onChange={(e) => setVisualEffect(e.target.value)}>
            <option value="">—</option>
            {VISUAL_EFFECTS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Optionnel"
        />
      </div>

      <button type="submit" className="btn-primary">Enregistrer la blessure</button>
    </form>
  );
}
