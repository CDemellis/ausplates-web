import { PlateFormatIcon } from './icons';
import {
  Listing,
  PlateColorScheme,
  PlateSizeFormat,
  PlateMaterial,
  VehicleType,
  getColorSchemeColors,
  PLATE_MATERIAL_NAMES,
  SIZE_FORMAT_NAMES,
} from '@/types/listing';

// Light colors that need a border for visibility
const LIGHT_COLORS = ['FFFFFF', 'FFD100', 'FFD700', 'F5F5F5', 'C0C0C0', 'D2B48C', '87CEEB'];

interface ColorSwatchIconProps {
  hexColor: string;
  size?: number;
  className?: string;
}

/**
 * A small circular color swatch for displaying plate colors
 */
export function ColorSwatchIcon({ hexColor, size = 16, className = '' }: ColorSwatchIconProps) {
  const needsBorder = LIGHT_COLORS.includes(hexColor.toUpperCase());

  return (
    <span
      className={`inline-block rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `#${hexColor}`,
        border: needsBorder ? '1px solid #E5E5E5' : 'none',
      }}
    />
  );
}

interface DualColorSwatchIconProps {
  backgroundColor: string;
  textColor: string;
  size?: number;
  className?: string;
}

/**
 * Shows both background and text color in a layered swatch
 */
export function DualColorSwatchIcon({
  backgroundColor,
  textColor,
  size = 20,
  className = '',
}: DualColorSwatchIconProps) {
  const innerSize = size * 0.5;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `#${backgroundColor}`,
        border: '0.5px solid #E5E5E5',
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: innerSize,
          height: innerSize,
          backgroundColor: `#${textColor}`,
        }}
      />
    </span>
  );
}

interface PlateFeatureTagProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

/**
 * A tag displaying an icon and label for a plate feature
 */
export function PlateFeatureTag({ icon, label, className = '' }: PlateFeatureTagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1.5
        bg-[var(--background-subtle)]
        rounded-md
        text-sm
        ${className}
      `}
    >
      <span className="text-[var(--text-muted)] flex-shrink-0">{icon}</span>
      <span className="text-[var(--text)]">{label}</span>
    </span>
  );
}

// SF Symbol equivalents as simple SVG icons
function MaterialIcon({ material }: { material: PlateMaterial }) {
  const iconClass = "w-3.5 h-3.5";

  switch (material) {
    case 'aluminium':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <rect x="3" y="3" width="14" height="14" rx="2" />
        </svg>
      );
    case 'acrylic':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L12 6L16 6.5L13 9.5L14 14L10 12L6 14L7 9.5L4 6.5L8 6L10 2Z" />
        </svg>
      );
    case 'polycarbonate':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" />
        </svg>
      );
    case 'enamel':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3C3.4 3 3 3.4 3 4V14L7 10L11 14L15 10L17 12V4C17 3.4 16.6 3 16 3H4Z" />
          <path d="M3 14V16C3 16.6 3.4 17 4 17H16C16.6 17 17 16.6 17 16V12L15 10L11 14L7 10L3 14Z" />
        </svg>
      );
    default:
      return null;
  }
}

function CharCountIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 5C3 4.4 3.4 4 4 4H8C8.6 4 9 4.4 9 5V6H11V5C11 4.4 11.4 4 12 4H16C16.6 4 17 4.4 17 5V7C17 7.6 16.6 8 16 8H12C11.4 8 11 7.6 11 7V6H9V7C9 7.6 8.6 8 8 8H4C3.4 8 3 7.6 3 7V5Z" />
      <path d="M5 11H15V13H5V11Z" />
      <path d="M5 15H12V17H5V15Z" />
    </svg>
  );
}

function VehicleIcon({ vehicleType }: { vehicleType: VehicleType }) {
  const iconClass = "w-3.5 h-3.5";

  switch (vehicleType) {
    case 'motorcycle':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <circle cx="5" cy="14" r="3" />
          <circle cx="15" cy="14" r="3" />
          <path d="M5 11L8 6H12L10 11H5Z" />
          <path d="M10 11L12 6L15 11H10Z" />
        </svg>
      );
    case 'trailer':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <rect x="2" y="6" width="12" height="8" rx="1" />
          <circle cx="5" cy="16" r="2" />
          <circle cx="11" cy="16" r="2" />
          <path d="M14 10H18V14H14V10Z" />
        </svg>
      );
    default:
      return null;
  }
}

// Map size format to plate format type for icon
function getSizeFormatIconType(sizeFormat: PlateSizeFormat): string {
  switch (sizeFormat) {
    case 'standard': return 'standard';
    case 'slimline': return 'slimline';
    case 'euro': return 'euro';
    case 'square': return 'square';
    case 'motorcycle': return 'motorcycle';
    case 'jdm': return 'jdm';
    case 'us_style': return 'standard';
    default: return 'standard';
  }
}

interface PlateFeatureTagsProps {
  listing: Listing;
  className?: string;
}

/**
 * Displays all relevant feature tags for a listing
 */
export function PlateFeatureTags({ listing, className = '' }: PlateFeatureTagsProps) {
  const colors = listing.colorScheme ? getColorSchemeColors(listing.colorScheme) : null;

  // Group formats to show "2x Standard" or individual tags
  const formatCounts = listing.sizeFormats?.reduce((acc, format) => {
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {} as Record<PlateSizeFormat, number>) || {};

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Size format tags with plate icons */}
      {Object.entries(formatCounts).map(([format, count]) => (
        <PlateFeatureTag
          key={format}
          icon={
            <PlateFormatIcon
              type={getSizeFormatIconType(format as PlateSizeFormat)}
              size={14}
              color="currentColor"
              strokeWidth={1}
            />
          }
          label={count > 1 ? `${count}x ${SIZE_FORMAT_NAMES[format as PlateSizeFormat]}` : SIZE_FORMAT_NAMES[format as PlateSizeFormat]}
        />
      ))}

      {/* Color scheme tag with dual swatch */}
      {listing.colorScheme && colors && (
        <PlateFeatureTag
          icon={
            <DualColorSwatchIcon
              backgroundColor={colors.background.replace('#', '')}
              textColor={colors.text.replace('#', '')}
              size={16}
            />
          }
          label={listing.colorScheme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        />
      )}

      {/* Material tag */}
      {listing.material && (
        <PlateFeatureTag
          icon={<MaterialIcon material={listing.material} />}
          label={PLATE_MATERIAL_NAMES[listing.material] || listing.material}
        />
      )}

      {/* Character count tag */}
      {listing.characterCount && (
        <PlateFeatureTag
          icon={null}
          label={`${listing.characterCount} Letters`}
        />
      )}

      {/* Vehicle type (if not car) */}
      {listing.vehicleType && listing.vehicleType !== 'car' && (
        <PlateFeatureTag
          icon={<VehicleIcon vehicleType={listing.vehicleType} />}
          label={listing.vehicleType.charAt(0).toUpperCase() + listing.vehicleType.slice(1)}
        />
      )}
    </div>
  );
}
