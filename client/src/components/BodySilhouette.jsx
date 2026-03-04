import { useMemo } from 'react';
import './BodySilhouette.css';

// Zones SVG approximatives (vue de face) – coordonnées normalisées 0–100
const BODY_ZONES = {
  head: { path: 'M 50 5 L 75 18 L 78 45 L 22 45 L 25 18 Z', label: 'Tête' },
  torso: { path: 'M 28 45 L 72 45 L 70 85 L 30 85 Z', label: 'Torse' },
  arm_left: { path: 'M 22 48 L 8 50 L 5 72 L 20 70 L 28 50 Z', label: 'Bras gauche' },
  arm_right: { path: 'M 78 48 L 92 50 L 95 72 L 80 70 L 72 50 Z', label: 'Bras droit' },
  forearm_left: { path: 'M 8 72 L 2 85 L 18 88 L 20 72 Z', label: 'Avant-bras gauche' },
  forearm_right: { path: 'M 92 72 L 98 85 L 82 88 L 80 72 Z', label: 'Avant-bras droit' },
  hand_left: { path: 'M 2 85 L 0 95 L 16 96 L 18 88 Z', label: 'Main gauche' },
  hand_right: { path: 'M 98 85 L 100 95 L 84 96 L 82 88 Z', label: 'Main droite' },
  leg_left: { path: 'M 30 85 L 35 88 L 38 98 L 48 98 L 48 88 L 30 85 Z', label: 'Jambe gauche' },
  leg_right: { path: 'M 70 85 L 65 88 L 62 98 L 52 98 L 52 88 L 70 85 Z', label: 'Jambe droite' },
  foot_left: { path: 'M 35 98 L 32 100 L 50 100 L 48 98 Z', label: 'Pied gauche' },
  foot_right: { path: 'M 65 98 L 68 100 L 50 100 L 52 98 Z', label: 'Pied droit' },
};

function getFillForPart(partId, injuriesByPart, visualEffects) {
  const injury = injuriesByPart[partId];
  if (!injury) return 'var(--silhouette-default)';
  const effect = injury.visual_effect || injury.visualEffect;
  if (effect === 'red' || !effect) return 'var(--wound)';
  if (effect === 'dark') return 'var(--necrosis)';
  if (effect === 'yellow') return 'var(--contusion)';
  if (effect === 'bandage') return 'var(--bandage)';
  if (effect === 'splint') return 'var(--bandage)';
  if (effect === 'unusable') return 'var(--necrosis)';
  return 'var(--wound)';
}

export default function BodySilhouette({
  bodyParts = [],
  injuries = [],
  selectedPartId,
  onSelectPart,
  compact = false,
}) {
  const injuriesByPart = useMemo(() => {
    const map = {};
    injuries.forEach((i) => {
      const id = i.body_part_id || i.bodyPartId;
      if (id && (!map[id] || !map[id].id)) map[id] = i;
    });
    return map;
  }, [injuries]);

  const partIds = bodyParts.length
    ? bodyParts.map((p) => p.id)
    : Object.keys(BODY_ZONES);

  return (
    <div className={`body-silhouette-wrap ${compact ? 'body-silhouette-wrap--compact' : ''}`}>
      <svg
        className="body-silhouette"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="silhouette-glow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {partIds.map((partId) => {
          const zone = BODY_ZONES[partId];
          if (!zone) return null;
          const isSelected = selectedPartId === partId;
          const fill = getFillForPart(partId, injuriesByPart);
          return (
            <path
              key={partId}
              d={zone.path}
              className="body-silhouette-zone"
              data-selected={isSelected}
              style={{ fill }}
              onClick={() => onSelectPart?.(partId)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectPart?.(partId)}
              role="button"
              tabIndex={0}
              aria-label={zone.label}
              aria-pressed={isSelected}
            />
          );
        })}
      </svg>
    </div>
  );
}
