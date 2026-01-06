import { AustralianState } from '@/types/listing';

interface PlateViewProps {
  combination: string;
  state: AustralianState;
  size?: 'small' | 'medium' | 'large';
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

export function PlateView({ combination, state, size = 'medium', className = '' }: PlateViewProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`
        inline-flex flex-col items-center justify-center
        bg-[var(--plate-background)] rounded-md
        ${styles.container}
        ${className}
      `}
    >
      <span
        className={`
          font-semibold tracking-widest uppercase
          text-[var(--green)]
          ${styles.state}
        `}
      >
        {state}
      </span>
      <span
        className={`
          font-bold tracking-wider uppercase
          text-white
          ${styles.combo}
        `}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {combination}
      </span>
    </div>
  );
}
