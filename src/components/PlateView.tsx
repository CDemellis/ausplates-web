import { AustralianState, PlateColorScheme } from '@/types/listing';
import { PlateTemplate } from './PlateTemplate';

interface PlateViewProps {
  combination: string;
  state: AustralianState;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  colorScheme?: PlateColorScheme;
  className?: string;
}

/**
 * PlateView component for displaying Australian number plates
 * Uses the universal PlateTemplate for consistent rendering across all states
 * Matches the iOS app PlateView exactly
 */
export function PlateView({
  combination,
  state,
  size = 'medium',
  colorScheme,
  className = ''
}: PlateViewProps) {
  return (
    <PlateTemplate
      combination={combination}
      state={state}
      colorScheme={colorScheme}
      size={size}
      className={className}
    />
  );
}
