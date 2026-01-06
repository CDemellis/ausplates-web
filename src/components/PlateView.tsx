import { AustralianState, PlateColorScheme, getColorSchemeColors } from '@/types/listing';

interface PlateViewProps {
  combination: string;
  state: AustralianState;
  size?: 'small' | 'medium' | 'large';
  colorScheme?: PlateColorScheme;
  className?: string;
}

const sizeStyles = {
  small: {
    container: 'h-11 px-4',
    state: 'text-[10px]',
    combo: 'text-sm',
  },
  medium: {
    container: 'h-16 px-6',
    state: 'text-xs',
    combo: 'text-xl',
  },
  large: {
    container: 'h-24 px-8',
    state: 'text-sm',
    combo: 'text-3xl',
  },
};

// Light backgrounds that need dark container around them for visibility
const LIGHT_BACKGROUNDS = ['#FFFFFF', '#FFD100', '#F5F5F5'];

export function PlateView({
  combination,
  state,
  size = 'medium',
  colorScheme,
  className = ''
}: PlateViewProps) {
  const styles = sizeStyles[size];
  const colors = getColorSchemeColors(colorScheme);
  const isLightBackground = LIGHT_BACKGROUNDS.includes(colors.background.toUpperCase());

  return (
    <div
      className={`
        inline-flex flex-col items-center justify-center
        rounded-md border-2
        ${styles.container}
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        borderColor: isLightBackground ? '#E5E5E5' : colors.background,
      }}
    >
      <span
        className={`
          font-semibold tracking-widest uppercase
          ${styles.state}
        `}
        style={{ color: colors.text, opacity: 0.7 }}
      >
        {state}
      </span>
      <span
        className={`
          font-bold tracking-wider uppercase
          ${styles.combo}
        `}
        style={{
          color: colors.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {combination}
      </span>
    </div>
  );
}
