'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
  PLATE_TYPE_NAMES,
  SIZE_FORMAT_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// States
const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

// Plate types
const PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'numeric',
  'prestige', 'deluxe', 'liquid_metal', 'frameless', 'signature',
  'afl_team', 'fishing', 'business', 'sequential', 'car_brand',
];

// Size formats
const SIZE_FORMATS: PlateSizeFormat[] = [
  'standard', 'slimline', 'euro', 'square', 'us_style', 'jdm', 'motorcycle',
];

// Common color schemes (shown first)
const COMMON_COLOR_SCHEMES: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black',
];

// All color schemes
const ALL_COLOR_SCHEMES: PlateColorScheme[] = [
  ...COMMON_COLOR_SCHEMES,
  'green_on_white', 'maroon_on_white', 'white_on_blue', 'white_on_maroon',
  'yellow_on_black', 'red_on_white', 'pink_on_white', 'purple_on_white',
  'orange_on_white', 'grey_on_black', 'teal_on_white', 'ocean_blue_on_white',
  'sky_blue_on_white', 'navy_on_white', 'lime_on_white', 'forest_green_on_white',
  'burgundy_on_white', 'fire_red_on_white', 'charcoal_on_white', 'brown_on_white',
  'tan_on_black', 'cream_on_black', 'off_white_on_black',
  'matte_black_on_white', 'matte_white_on_black',
  'blue_on_white_jdm', 'green_on_white_jdm',
  'afl_carlton', 'afl_collingwood', 'afl_richmond', 'afl_essendon',
  'afl_melbourne', 'afl_geelong', 'afl_hawthorn', 'afl_north_melbourne',
  'afl_western_bulldogs', 'afl_st_kilda',
  'liquid_metal_silver', 'liquid_metal_chrome',
];

// Color scheme labels
const COLOR_SCHEME_NAMES: Record<PlateColorScheme, string> = {
  black_on_white: 'Black on White',
  white_on_black: 'White on Black',
  blue_on_white: 'Blue on White',
  black_on_yellow: 'Black on Yellow',
  green_on_white: 'Green on White',
  maroon_on_white: 'Maroon on White',
  silver_on_black: 'Silver on Black',
  gold_on_black: 'Gold on Black',
  white_on_blue: 'White on Blue',
  white_on_maroon: 'White on Maroon',
  yellow_on_black: 'Yellow on Black',
  red_on_white: 'Red on White',
  pink_on_white: 'Pink on White',
  purple_on_white: 'Purple on White',
  orange_on_white: 'Orange on White',
  grey_on_black: 'Grey on Black',
  teal_on_white: 'Teal on White',
  ocean_blue_on_white: 'Ocean Blue on White',
  sky_blue_on_white: 'Sky Blue on White',
  navy_on_white: 'Navy on White',
  lime_on_white: 'Lime on White',
  forest_green_on_white: 'Forest Green on White',
  burgundy_on_white: 'Burgundy on White',
  fire_red_on_white: 'Fire Red on White',
  charcoal_on_white: 'Charcoal on White',
  brown_on_white: 'Brown on White',
  tan_on_black: 'Tan on Black',
  cream_on_black: 'Cream on Black',
  off_white_on_black: 'Off White on Black',
  matte_black_on_white: 'Matte Black on White',
  matte_white_on_black: 'Matte White on Black',
  blue_on_white_jdm: 'JDM Blue',
  green_on_white_jdm: 'JDM Green',
  afl_carlton: 'AFL Carlton',
  afl_collingwood: 'AFL Collingwood',
  afl_richmond: 'AFL Richmond',
  afl_essendon: 'AFL Essendon',
  afl_melbourne: 'AFL Melbourne',
  afl_geelong: 'AFL Geelong',
  afl_hawthorn: 'AFL Hawthorn',
  afl_north_melbourne: 'AFL North Melbourne',
  afl_western_bulldogs: 'AFL Western Bulldogs',
  afl_st_kilda: 'AFL St Kilda',
  liquid_metal_silver: 'Liquid Metal Silver',
  liquid_metal_chrome: 'Liquid Metal Chrome',
  custom: 'Custom',
};

// Price presets
const PRICE_PRESETS = [
  { label: 'Under $5K', min: 0, max: 500000 },
  { label: '$5K - $15K', min: 500000, max: 1500000 },
  { label: '$15K - $50K', min: 1500000, max: 5000000 },
  { label: '$50K - $100K', min: 5000000, max: 10000000 },
  { label: '$100K+', min: 10000000, max: null },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'views', label: 'Most Viewed' },
];

export interface FilterState {
  states: AustralianState[];
  plateTypes: PlateType[];
  colorSchemes: PlateColorScheme[];
  sizeFormats: PlateSizeFormat[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: string;
}

interface FilterPanelProps {
  /** Fixed state filter (for state-specific pages) */
  fixedState?: AustralianState;
  /** Callback when filters change */
  onFilterChange?: (filters: FilterState) => void;
  /** Show as sidebar (desktop) or bottom sheet (mobile) */
  variant?: 'sidebar' | 'sheet';
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <fieldset className="border-b border-[var(--border)] py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
      >
        <legend className="text-sm font-semibold text-[var(--text)]">{title}</legend>
        <svg
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </fieldset>
  );
}

function ChipSelect<T extends string>({
  options,
  selected,
  onChange,
  getLabel,
  getColor,
}: {
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  getLabel: (value: T) => string;
  getColor?: (value: T) => { text: string; background: string } | null;
}) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const colors = getColor?.(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={isSelected}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-colors border
              ${isSelected
                ? 'bg-[var(--green)] text-white border-[var(--green)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)]'
              }
              focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2
            `}
          >
            {colors && (
              <span
                className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: colors.background }}
                aria-hidden="true"
              >
                <span
                  className="block w-2 h-2 rounded-full mx-auto mt-1"
                  style={{ backgroundColor: colors.text }}
                />
              </span>
            )}
            {getLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

export function FilterPanel({ fixedState, onFilterChange, variant = 'sidebar' }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const parseFiltersFromUrl = useCallback((): FilterState => {
    const statesParam = searchParams.get('states');
    const plateTypesParam = searchParams.get('plate_types');
    const colorSchemesParam = searchParams.get('color_schemes');
    const sizeFormatsParam = searchParams.get('size_formats');
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');
    const sortParam = searchParams.get('sort') || 'recent';

    return {
      states: statesParam ? (statesParam.split(',') as AustralianState[]) : [],
      plateTypes: plateTypesParam ? (plateTypesParam.split(',') as PlateType[]) : [],
      colorSchemes: colorSchemesParam ? (colorSchemesParam.split(',') as PlateColorScheme[]) : [],
      sizeFormats: sizeFormatsParam ? (sizeFormatsParam.split(',') as PlateSizeFormat[]) : [],
      minPrice: minPriceParam ? parseInt(minPriceParam, 10) : null,
      maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : null,
      sort: sortParam,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(parseFiltersFromUrl);
  const [showAllColors, setShowAllColors] = useState(false);

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();

    // Preserve query if exists
    const query = searchParams.get('query');
    if (query) params.set('query', query);

    if (newFilters.states.length > 0) params.set('states', newFilters.states.join(','));
    if (newFilters.plateTypes.length > 0) params.set('plate_types', newFilters.plateTypes.join(','));
    if (newFilters.colorSchemes.length > 0) params.set('color_schemes', newFilters.colorSchemes.join(','));
    if (newFilters.sizeFormats.length > 0) params.set('size_formats', newFilters.sizeFormats.join(','));
    if (newFilters.minPrice !== null) params.set('min_price', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== null) params.set('max_price', newFilters.maxPrice.toString());
    if (newFilters.sort !== 'recent') params.set('sort', newFilters.sort);

    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    updateUrl(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, updateUrl, onFilterChange]);

  // Count active filters
  const activeFilterCount =
    filters.states.length +
    filters.plateTypes.length +
    filters.colorSchemes.length +
    filters.sizeFormats.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    const cleared: FilterState = {
      states: [],
      plateTypes: [],
      colorSchemes: [],
      sizeFormats: [],
      minPrice: null,
      maxPrice: null,
      sort: 'recent',
    };
    setFilters(cleared);
    updateUrl(cleared);
    onFilterChange?.(cleared);
  };

  // Sync with URL changes (back/forward navigation)
  useEffect(() => {
    setFilters(parseFiltersFromUrl());
  }, [parseFiltersFromUrl]);

  const displayedColorSchemes = showAllColors ? ALL_COLOR_SCHEMES : COMMON_COLOR_SCHEMES;

  return (
    <div className={`bg-white ${variant === 'sidebar' ? 'rounded-xl border border-[var(--border)] p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--green)] rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-[var(--green)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--green)] rounded"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label htmlFor="sort-select" className="block text-sm font-semibold text-[var(--text)] mb-2">
          Sort by
        </label>
        <select
          id="sort-select"
          value={filters.sort}
          onChange={(e) => handleFilterChange({ sort: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* State Filter (hidden if fixedState is set) */}
      {!fixedState && (
        <FilterSection title="State">
          <ChipSelect
            options={STATES}
            selected={filters.states}
            onChange={(states) => handleFilterChange({ states })}
            getLabel={(state) => state}
          />
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((preset) => {
              const isSelected =
                filters.minPrice === preset.min &&
                (preset.max === null ? filters.maxPrice === null : filters.maxPrice === preset.max);

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    handleFilterChange({
                      minPrice: preset.min,
                      maxPrice: preset.max,
                    })
                  }
                  aria-pressed={isSelected}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                    ${isSelected
                      ? 'bg-[var(--green)] text-white border-[var(--green)]'
                      : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)]'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2
                  `}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom price inputs */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor="min-price" className="sr-only">Minimum price</label>
              <input
                type="number"
                id="min-price"
                placeholder="Min $"
                value={filters.minPrice ? filters.minPrice / 100 : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) * 100 : null;
                  handleFilterChange({ minPrice: value });
                }}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
              />
            </div>
            <span className="text-[var(--text-muted)]">to</span>
            <div className="flex-1">
              <label htmlFor="max-price" className="sr-only">Maximum price</label>
              <input
                type="number"
                id="max-price"
                placeholder="Max $"
                value={filters.maxPrice ? filters.maxPrice / 100 : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) * 100 : null;
                  handleFilterChange({ maxPrice: value });
                }}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Plate Type */}
      <FilterSection title="Plate Type" defaultOpen={false}>
        <ChipSelect
          options={PLATE_TYPES}
          selected={filters.plateTypes}
          onChange={(plateTypes) => handleFilterChange({ plateTypes })}
          getLabel={(type) => PLATE_TYPE_NAMES[type]}
        />
      </FilterSection>

      {/* Color Scheme */}
      <FilterSection title="Color" defaultOpen={false}>
        <div className="space-y-3">
          <ChipSelect
            options={displayedColorSchemes}
            selected={filters.colorSchemes}
            onChange={(colorSchemes) => handleFilterChange({ colorSchemes })}
            getLabel={(scheme) => COLOR_SCHEME_NAMES[scheme]}
            getColor={(scheme) => COLOR_SCHEME_COLORS[scheme]}
          />
          {!showAllColors && (
            <button
              type="button"
              onClick={() => setShowAllColors(true)}
              className="text-sm text-[var(--green)] hover:underline focus:outline-none"
            >
              Show all colors ({ALL_COLOR_SCHEMES.length})
            </button>
          )}
          {showAllColors && (
            <button
              type="button"
              onClick={() => setShowAllColors(false)}
              className="text-sm text-[var(--text-muted)] hover:underline focus:outline-none"
            >
              Show fewer colors
            </button>
          )}
        </div>
      </FilterSection>

      {/* Size Format */}
      <FilterSection title="Size Format" defaultOpen={false}>
        <ChipSelect
          options={SIZE_FORMATS}
          selected={filters.sizeFormats}
          onChange={(sizeFormats) => handleFilterChange({ sizeFormats })}
          getLabel={(format) => SIZE_FORMAT_NAMES[format]}
        />
      </FilterSection>
    </div>
  );
}
