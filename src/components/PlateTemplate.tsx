import { AustralianState, PlateColorScheme, getColorSchemeColors } from '@/types/listing';

interface PlateTemplateProps {
  combination: string;
  state: AustralianState;
  colorScheme?: PlateColorScheme;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

// Size config matching iOS PlateView proportions (2.78:1 aspect ratio)
const sizeConfig = {
  small: { width: 122, height: 44, fontSize: 24, stateSize: 7, cornerRadius: 3, innerPadding: 2, borderWidth: 0.8 },
  medium: { width: 194, height: 70, fontSize: 38, stateSize: 10, cornerRadius: 5, innerPadding: 3.5, borderWidth: 1.2 },
  large: { width: 280, height: 100, fontSize: 56, stateSize: 13, cornerRadius: 7, innerPadding: 5, borderWidth: 1.8 },
  xlarge: { width: 372, height: 134, fontSize: 72, stateSize: 16, cornerRadius: 9, innerPadding: 6, borderWidth: 2.2 },
};

// Font: System font stack similar to iOS SF Pro
const PLATE_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";

/**
 * Universal plate template component that renders consistently for all Australian states
 * Matches the iOS PlateView design exactly
 */
export function PlateTemplate({
  combination,
  state,
  colorScheme = 'white_on_black',
  size = 'medium',
  className = '',
}: PlateTemplateProps) {
  const colors = getColorSchemeColors(colorScheme);
  const config = sizeConfig[size];

  const { width, height, fontSize, stateSize, cornerRadius, innerPadding, borderWidth } = config;

  // Calculate positions
  const innerCornerRadius = cornerRadius - innerPadding / 2;
  const centerX = width / 2;

  // Vertical positioning matching iOS VStack spacing
  const stateY = height * 0.32;
  const comboY = height * 0.68;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${state} plate ${combination}`}
    >
      {/* Outer plate background */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={colors.background}
      />

      {/* Inner border stroke */}
      <rect
        x={innerPadding}
        y={innerPadding}
        width={width - innerPadding * 2}
        height={height - innerPadding * 2}
        rx={innerCornerRadius}
        ry={innerCornerRadius}
        fill="none"
        stroke={colors.text}
        strokeWidth={borderWidth}
      />

      {/* State label */}
      <text
        x={centerX}
        y={stateY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={stateSize}
        fontFamily={PLATE_FONT}
        fontWeight="500"
        letterSpacing="0.15em"
      >
        {state}
      </text>

      {/* Combination text */}
      <text
        x={centerX}
        y={comboY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={fontSize}
        fontFamily={PLATE_FONT}
        fontWeight="400"
        letterSpacing="0.05em"
      >
        {combination.toUpperCase()}
      </text>
    </svg>
  );
}
