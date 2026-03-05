import { useMemo } from 'react';
import './BodySilhouette.css';

// Zones issues du SVG fourni, avec possibilité d'avoir plusieurs paths pour la même partie
const BODY_ZONES = [
  // Tête
  {
    id: 'head',
    label: 'Tête',
    path:
      'M860.041 654.835c0 -43.563 26.916 -78.878 60.117 -78.878 15.942 0 31.233 8.312 42.507 23.103s17.608 34.855 17.608 55.775c0 43.563 -26.916 78.878 -60.117 78.878s-60.115 -35.317 -60.115 -78.878',
  },
  // Buste (tout mappé sur \"torso\")
  {
    id: 'torso',
    label: 'Torse',
    path: 'M816.052 733.713h208.208v110.568H816.052z',
  },
  {
    id: 'torso',
    label: 'Torse',
    path:
      'm1016.023 844.268 -30.824 123.298h-127.363l-30.824 -123.298z',
  },
  {
    id: 'torso',
    label: 'Torse',
    path: 'M836.76 967.565h166.55v110.568h-166.55z',
  },
  // Bras droit
  {
    id: 'arm_right',
    label: 'Bras droit',
    path:
      'm712.288 876.992 53.517 -136.561 50.252 19.728 -53.517 136.559z',
  },
  {
    id: 'forearm_right',
    label: 'Avant-bras droit',
    path:
      'm658.771 1013.57 53.517 -136.559 40.188 15.729 -53.517 136.559z',
  },
  {
    id: 'hand_right',
    label: 'Main droite',
    path:
      'm624.787 1088.55 29.991 -76.512 40.188 15.729 -29.991 76.512z',
  },
  // Bras gauche
  {
    id: 'arm_left',
    label: 'Bras gauche',
    path:
      'm1128.027 876.992 -53.517 -136.561 -50.252 19.728 53.517 136.559z',
  },
  {
    id: 'forearm_left',
    label: 'Avant-bras gauche',
    path:
      'm1181.544 1013.57 -53.517 -136.559 -40.19 15.729 53.519 136.559z',
  },
  {
    id: 'hand_left',
    label: 'Main gauche',
    path:
      'm1215.528 1088.55 -29.991 -76.512 -40.188 15.729 29.991 76.512z',
  },
  // Jambes (cuisse + mollet) mappées sur leg_left / leg_right
  {
    id: 'leg_right',
    label: 'Jambe droite',
    path: 'M844.407 1078.122h58.183v253.724H844.407z',
  },
  {
    id: 'leg_left',
    label: 'Jambe gauche',
    path: 'M939.452 1078.122h58.183v253.724h-58.183z',
  },
  {
    id: 'leg_right',
    label: 'Jambe droite',
    path: 'M849.799 1331.846h46.655v183.213h-46.655z',
  },
  {
    id: 'leg_left',
    label: 'Jambe gauche',
    path: 'M945.216 1331.846h46.655v183.213H945.216z',
  },
  // Pieds
  {
    id: 'foot_right',
    label: 'Pied droit',
    path: 'M847.135 1515.06h51.985v64.848h-51.985z',
  },
  {
    id: 'foot_left',
    label: 'Pied gauche',
    path: 'M942.549 1515.06h51.985v64.848H942.549z',
  },
];

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

  const visibleZones = useMemo(() => {
    if (!bodyParts.length) return BODY_ZONES;
    const allowedIds = new Set(bodyParts.map((p) => p.id));
    return BODY_ZONES.filter((z) => allowedIds.has(z.id));
  }, [bodyParts]);

  return (
    <div className={`body-silhouette-wrap ${compact ? 'body-silhouette-wrap--compact' : ''}`}>
      <svg
        className="body-silhouette"
        // On recadre le viewBox autour du corps pour qu'il remplisse mieux le cadre
        // (coordonnées estimées à partir du SVG : x ~ 600–1350, y ~ 600–1600)
        viewBox="620 520 600 1100"
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
        {visibleZones.map((zone, index) => {
          const isSelected = selectedPartId === zone.id;
          const fill = getFillForPart(zone.id, injuriesByPart);
          return (
            <path
              key={`${zone.id}-${index}`}
              d={zone.path}
              className="body-silhouette-zone"
              data-selected={isSelected}
              style={{ fill }}
              onClick={() => onSelectPart?.(zone.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectPart?.(zone.id)}
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
