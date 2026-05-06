import type { EmotionType } from '../../types/emotion';
import { POSITIVE_EMOTIONS, NEGATIVE_EMOTIONS, NEUTRAL_NEGATIVE_EMOTIONS } from '../../config/emotionTypes';

interface SelectedEmotion {
  tag: EmotionType;
  intensity: number;
}

interface EmotionTagPickerProps {
  selected: SelectedEmotion[];
  onChange: (emotions: SelectedEmotion[]) => void;
}

const EMOTION_CONFIG: Record<EmotionType, { label: string; group: 'positive' | 'negative' | 'neutral' }> = {
  focused:   { label: 'Focused',   group: 'positive' },
  patient:   { label: 'Patient',   group: 'positive' },
  confident: { label: 'Confident', group: 'positive' },
  calm:      { label: 'Calm',      group: 'positive' },
  fomo:      { label: 'FOMO',      group: 'negative' },
  revenge:   { label: 'Revenge',   group: 'negative' },
  tilt:      { label: 'Tilt',      group: 'negative' },
  oversize:  { label: 'Oversize',  group: 'negative' },
  greedy:    { label: 'Greedy',    group: 'negative' },
  hesitant:  { label: 'Hesitant',  group: 'neutral'  },
  anxious:   { label: 'Anxious',   group: 'neutral'  },
  bored:     { label: 'Bored',     group: 'neutral'  },
};

const GROUP_STYLES = {
  positive: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  negative: 'bg-red-400/15 text-red-400 border-red-400/30',
  neutral:  'bg-amber-400/15 text-amber-400 border-amber-400/30',
};

const GROUP_ACTIVE = {
  positive: 'bg-emerald-500/30 border-emerald-400 ring-1 ring-emerald-400/50',
  negative: 'bg-red-500/30 border-red-400 ring-1 ring-red-400/50',
  neutral:  'bg-amber-500/30 border-amber-400 ring-1 ring-amber-400/50',
};

export default function EmotionTagPicker({ selected, onChange }: EmotionTagPickerProps) {
  const selectedMap = new Map(selected.map(e => [e.tag, e.intensity]));

  const toggle = (tag: EmotionType) => {
    if (selectedMap.has(tag)) {
      onChange(selected.filter(e => e.tag !== tag));
    } else {
      onChange([...selected, { tag, intensity: 5 }]);
    }
  };

  const setIntensity = (tag: EmotionType, intensity: number) => {
    onChange(selected.map(e => e.tag === tag ? { ...e, intensity } : e));
  };

  const renderGroup = (tags: readonly EmotionType[], label: string) => (
    <div key={label} className="space-y-2">
      <p className="text-[11px] uppercase tracking-wider text-gray-600 font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const cfg = EMOTION_CONFIG[tag];
          const isActive = selectedMap.has(tag);
          return (
            <div key={tag} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggle(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive ? GROUP_ACTIVE[cfg.group] : GROUP_STYLES[cfg.group]
                }`}
              >
                {cfg.label}
              </button>
              {isActive && (
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-gray-600">{selectedMap.get(tag)}</span>
                  <input
                    type="range" min={1} max={10}
                    value={selectedMap.get(tag) ?? 5}
                    onChange={e => setIntensity(tag, Number(e.target.value))}
                    className="w-16 h-1 accent-purple-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderGroup(POSITIVE_EMOTIONS, 'Positive')}
      {renderGroup(NEGATIVE_EMOTIONS, 'Negative')}
      {renderGroup(NEUTRAL_NEGATIVE_EMOTIONS, 'Neutral')}
    </div>
  );
}
