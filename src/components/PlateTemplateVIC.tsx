import { PlateColorScheme, getColorSchemeColors } from '@/types/listing';

interface PlateTemplateVICProps {
  combination: string;
  colorScheme?: PlateColorScheme;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const sizeConfig = {
  small: { width: 140, height: 50, fontSize: 28, stateSize: 8 },
  medium: { width: 220, height: 79, fontSize: 44, stateSize: 11 },
  large: { width: 320, height: 115, fontSize: 64, stateSize: 14 },
  xlarge: { width: 440, height: 158, fontSize: 88, stateSize: 18 },
};

// Font: Bebas Neue is close to Australian plate fonts
// Loaded via next/font in layout.tsx as --font-bebas-neue
const PLATE_FONT = "var(--font-bebas-neue), 'Bebas Neue', 'Arial Narrow', sans-serif";

export function PlateTemplateVIC({
  combination,
  colorScheme = 'white_on_black',
  size = 'medium',
  className = '',
}: PlateTemplateVICProps) {
  const colors = getColorSchemeColors(colorScheme);
  const config = sizeConfig[size];

  // Plate proportions based on standard Australian plate (372x134mm = 2.776:1)
  const { width, height, fontSize, stateSize } = config;

  // Calculate relative positions
  const borderRadius = height * 0.075;
  const innerPadding = height * 0.05;
  const innerBorderWidth = height * 0.018;
  const stateY = height * 0.21;
  const comboY = height * 0.62;

  const centerX = width / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer plate background */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={colors.background}
      />

      {/* Inner border line */}
      <rect
        x={innerPadding}
        y={innerPadding}
        width={width - innerPadding * 2}
        height={height - innerPadding * 2}
        rx={borderRadius - innerPadding / 2}
        ry={borderRadius - innerPadding / 2}
        fill="none"
        stroke={colors.text}
        strokeWidth={innerBorderWidth}
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
        letterSpacing="0.2em"
      >
        VIC
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
        letterSpacing="0.05em"
      >
        {combination.toUpperCase()}
      </text>
    </svg>
  );
}
