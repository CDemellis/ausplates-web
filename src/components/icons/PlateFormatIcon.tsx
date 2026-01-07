/**
 * Plate Format Icons - Outline icons with text labels
 * Shows plate shape outline with abbreviated type name inside
 */

interface PlateFormatIconProps {
  size?: number; // Height in pixels (width scales proportionally)
  className?: string;
  color?: string; // Stroke/text color (default grey)
  strokeWidth?: number;
}

// Plate format aspect ratios (width:height)
// Standard: 372x134mm = 2.78:1
// Slimline: 520x110mm = 4.73:1
// Euro: 520x110mm = 4.73:1
// Square: 280x200mm = 1.4:1
// Motorcycle: 180x100mm = 1.8:1
// JDM: 330x165mm = 2:1

export function PlateIconStandard({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 2.78;
  const height = size;
  const radius = height * 0.12;
  const padding = strokeWidth / 2;
  const fontSize = height * 0.4;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        STD
      </text>
    </svg>
  );
}

export function PlateIconSlimline({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 4.73;
  const height = size;
  const radius = height * 0.15;
  const padding = strokeWidth / 2;
  const fontSize = height * 0.45;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        SLIM
      </text>
    </svg>
  );
}

export function PlateIconEuro({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 4.73;
  const height = size;
  const radius = height * 0.12;
  const padding = strokeWidth / 2;
  const bandWidth = width * 0.08;
  const fontSize = height * 0.45;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <line
        x1={bandWidth}
        y1={padding}
        x2={bandWidth}
        y2={height - padding}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={(width + bandWidth) / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        EURO
      </text>
    </svg>
  );
}

export function PlateIconSquare({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 1.4;
  const height = size;
  const radius = height * 0.1;
  const padding = strokeWidth / 2;
  const fontSize = height * 0.28;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        SQR
      </text>
    </svg>
  );
}

export function PlateIconMotorcycle({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 1.8;
  const height = size;
  const radius = height * 0.1;
  const padding = strokeWidth / 2;
  const fontSize = height * 0.3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        MOTO
      </text>
    </svg>
  );
}

export function PlateIconJDM({
  size = 24,
  className = '',
  color = '#6B7280',
  strokeWidth = 1.5,
}: PlateFormatIconProps) {
  const width = size * 2;
  const height = size;
  const radius = height * 0.1;
  const padding = strokeWidth / 2;
  const fontSize = height * 0.4;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={padding}
        y={padding}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
      >
        JDM
      </text>
    </svg>
  );
}

// Unified component that renders the appropriate icon based on plate type
export function PlateFormatIcon({
  type,
  size = 24,
  className = '',
  color,
  strokeWidth,
}: PlateFormatIconProps & { type: string }) {
  const props = { size, className, color, strokeWidth };

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
