// États généraux du personnage
export const GENERAL_STATES = [
  { id: 'good', label: 'Bon état' },
  { id: 'tired', label: 'Fatigué' },
  { id: 'disoriented', label: 'Désorienté' },
  { id: 'weakened', label: 'Affaibli' },
  { id: 'critical', label: 'État critique' },
  { id: 'unconscious', label: 'Inconscient' },
  { id: 'dying', label: 'Mort imminente' },
];

// Sensations
export const SENSATIONS = [
  { id: 'insignificant', label: 'Insignifiant' },
  { id: 'annoying', label: 'Gênant' },
  { id: 'painful', label: 'Douloureux' },
  { id: 'very_painful', label: 'Très douloureux' },
  { id: 'unbearable', label: 'Insupportable' },
];

// Effets visuels sur la silhouette
export const VISUAL_EFFECTS = [
  { id: 'red', label: 'Zone rouge (blessure)', color: '#c94f2e' },
  { id: 'dark', label: 'Zone sombre (nécrose)', color: '#3d2a2a' },
  { id: 'yellow', label: 'Zone jaune (contusion)', color: '#5c4a20' },
  { id: 'bandage', label: 'Bandage visible', color: '#6b5b4f' },
  { id: 'splint', label: 'Attelle visible', color: '#5a4a3a' },
  { id: 'weakened_posture', label: 'Posture affaiblie', color: '#4a4a4a' },
  { id: 'unusable', label: 'Membre inutilisable', color: '#2a2a2a' },
];

// Effets mobilité
export const MOBILITY_EFFECTS = [
  { id: 'none', label: 'Aucun' },
  { id: 'reduced_speed', label: 'Vitesse réduite' },
  { id: 'limp', label: 'Boiterie' },
  { id: 'partial_immobility', label: 'Immobilité partielle' },
  { id: 'total_immobility', label: 'Immobilité totale' },
];

// Effets combat
export const COMBAT_EFFECTS = [
  { id: 'none', label: 'Aucun' },
  { id: 'reduced_accuracy', label: 'Précision réduite' },
  { id: 'reduced_strength', label: 'Force réduite' },
  { id: 'weapon_difficulty', label: 'Difficulté à tenir une arme' },
  { id: 'limb_unusable', label: 'Impossible d\'utiliser un membre' },
];

// Effets cognitifs
export const COGNITIVE_EFFECTS = [
  { id: 'none', label: 'Aucun' },
  { id: 'blurred_vision', label: 'Vision trouble' },
  { id: 'disorientation', label: 'Désorientation' },
  { id: 'confusion', label: 'Confusion' },
  { id: 'loss_of_consciousness', label: 'Perte de conscience' },
];
