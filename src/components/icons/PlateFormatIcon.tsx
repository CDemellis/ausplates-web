/**
 * Plate Format Icons - Realistic plate shape icons with type labels
 * Each icon matches the actual aspect ratio of Australian plate formats
 */

interface PlateFormatIconProps {
  size?: number; // Height in pixels (width scales proportionally)
  className?: string;
  fill?: string;
  stroke?: string;
  labelColor?: string;
}

// Plate format aspect ratios (width:height)
// Standard: 372x134mm = 2.78:1
// Slimline: 520x110mm = 4.73:1
// Euro: 520x110mm = 4.73:1
// Square: 280x200mm = 1.4:1
// Motorcycle: 180x100mm = 1.8:1
// JDM: 330x165mm = 2:1

const defaultProps: PlateFormatIconProps = {
  size: 32,
  fill: '#1A1A1A',
  stroke: '#FFFFFF',
  labelColor: '#FFFFFF',
};

export function PlateIconStandard({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 2.78;
  const height = size;
  const radius = height * 0.08;
  const borderPadding = height * 0.06;
  const borderWidth = height * 0.025;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer plate */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      {/* Inner border */}
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      {/* Label */}
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.32}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.05em"
      >
        STANDARD
      </text>
    </svg>
  );
}

export function PlateIconSlimline({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 4.73;
  const height = size;
  const radius = height * 0.1;
  const borderPadding = height * 0.08;
  const borderWidth = height * 0.03;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.42}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.08em"
      >
        SLIMLINE
      </text>
    </svg>
  );
}

export function PlateIconEuro({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 4.73;
  const height = size;
  const radius = height * 0.08;
  const borderPadding = height * 0.06;
  const borderWidth = height * 0.025;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      {/* Euro-style blue band on left */}
      <clipPath id="euroClip">
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx={radius}
          ry={radius}
        />
      </clipPath>
      <rect
        x="0"
        y="0"
        width={width * 0.08}
        height={height}
        fill="#003399"
        clipPath="url(#euroClip)"
      />
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      <text
        x={width / 2 + width * 0.04}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.42}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.08em"
      >
        EURO
      </text>
    </svg>
  );
}

export function PlateIconSquare({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 1.4;
  const height = size;
  const radius = height * 0.06;
  const borderPadding = height * 0.05;
  const borderWidth = height * 0.02;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.22}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.05em"
      >
        SQUARE
      </text>
    </svg>
  );
}

export function PlateIconMotorcycle({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 1.8;
  const height = size;
  const radius = height * 0.07;
  const borderPadding = height * 0.055;
  const borderWidth = height * 0.022;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.2}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.03em"
      >
        MOTORCYCLE
      </text>
    </svg>
  );
}

export function PlateIconJDM({
  size = 32,
  className = '',
  fill = defaultProps.fill,
  stroke = defaultProps.stroke,
  labelColor = defaultProps.labelColor,
}: PlateFormatIconProps) {
  const width = size * 2;
  const height = size;
  const radius = height * 0.06;
  const borderPadding = height * 0.05;
  const borderWidth = height * 0.02;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
      <rect
        x={borderPadding}
        y={borderPadding}
        width={width - borderPadding * 2}
        height={height - borderPadding * 2}
        rx={radius - borderPadding / 2}
        ry={radius - borderPadding / 2}
        fill="none"
        stroke={stroke}
        strokeWidth={borderWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={height * 0.36}
        fontFamily="var(--font-bebas-neue), 'Bebas Neue', sans-serif"
        letterSpacing="0.08em"
      >
        JDM
      </text>
    </svg>
  );
}

// Unified component that renders the appropriate icon based on plate type
export function PlateFormatIcon({
  type,
  size = 32,
  className = '',
  fill,
  stroke,
  labelColor,
}: PlateFormatIconProps & { type: string }) {
  const props = { size, className, fill, stroke, labelColor };

  switch (type) {
    case 'standard':
      return <PlateIconStandard {...props} />;
    case 'slimline':
      return <PlateIconSlimline {...props} />;
    case 'euro':
      return <PlateIconEuro {...props} />;
    case 'square':
      return <PlateIconSquare {...props} />;
    case 'motorcycle':
      return <PlateIconMotorcycle {...props} />;
    case 'jdm':
      return <PlateIconJDM {...props} />;
    default:
      return <PlateIconStandard {...props} />;
  }
}
