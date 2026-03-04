import BodySilhouette from './BodySilhouette';
import './CharacterCard.css';

export default function CharacterCard({
  character,
  injuries = [],
  bodyParts = [],
  generalStateLabel,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`character-card ${selected ? 'character-card--selected' : ''}`}
      onClick={() => onClick?.(character)}
    >
      <div className="character-card-silhouette">
        <BodySilhouette
          bodyParts={bodyParts}
          injuries={injuries}
          compact
        />
      </div>
      <div className="character-card-info">
        <span className="character-card-name">{character.name}</span>
        {generalStateLabel && (
          <span className="character-card-state">{generalStateLabel}</span>
        )}
        {injuries.length > 0 && (
          <span className="character-card-wounds">{injuries.length} blessure(s)</span>
        )}
      </div>
    </button>
  );
}
