import { AustralianState, PlateColorScheme, getColorSchemeColors } from '@/types/listing';
import { PlateTemplateVIC } from './PlateTemplateVIC';

interface PlateViewProps {
  combination: string;
  state: AustralianState;
  size?: 'small' | 'medium' | 'large';
  colorScheme?: PlateColorScheme;
  className?: string;
}

// Map PlateView sizes to template sizes
const sizeMap = {
  small: 'small' as const,
  medium: 'medium' as const,
  large: 'large' as const,
};

// Fallback styles for states without templates yet
const fallbackSizeStyles = {
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
  // Use state-specific template if available
  if (state === 'VIC') {
    return (
      <PlateTemplateVIC
        combination={combination}
        colorScheme={colorScheme}
        size={sizeMap[size]}
        className={className}
      />
    );
  }

  // Fallback for states without templates yet
  const styles = fallbackSizeStyles[size];
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
          fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif",
        }}
      >
        {combination}
      </span>
    </div>
  );
}
