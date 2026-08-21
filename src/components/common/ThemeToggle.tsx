import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../hooks/useTheme';

const choices: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Monitor;
}> = [
  { value: 'system', label: '跟随系统', icon: Monitor },
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-toggle" aria-label="主题模式">
      {choices.map((choice) => {
        const Icon = choice.icon;
        return (
          <button
            className="theme-toggle__button"
            data-active={preference === choice.value}
            key={choice.value}
            type="button"
            onClick={() => setPreference(choice.value)}
            aria-label={choice.label}
            aria-pressed={preference === choice.value}
            title={choice.label}
          >
            <Icon size={16} strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}
