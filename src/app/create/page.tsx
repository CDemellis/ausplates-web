'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { PlateView } from '@/components/PlateView';
import { createListing, createCheckout } from '@/lib/api';

import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
  PlateMaterial,
  VehicleType,
  PLATE_TYPE_NAMES,
  SIZE_FORMAT_NAMES,
  PLATE_MATERIAL_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// ============================================
// TYPES
// ============================================

interface ListingDraft {
  // Step 1: Plate Details
  combination: string;
  state: AustralianState | null;
  plateType: PlateType | null;
  // Step 2: Appearance
  colorScheme: PlateColorScheme;
  sizeFormats: [PlateSizeFormat, PlateSizeFormat];
  material: PlateMaterial;
  vehicleType: VehicleType;
  // Step 3: Pricing & Details
  price: number; // in dollars for input, converted to cents on submit
  isOpenToOffers: boolean;
  description: string;
  // Step 4: Photos
  photos: string[]; // URLs after upload
  // Step 5: Review & Pay
  promoCode: string;
  boostType: 'none' | '7day' | '30day';
}

const INITIAL_DRAFT: ListingDraft = {
  combination: '',
  state: null,
  plateType: null,
  colorScheme: 'white_on_black',
  sizeFormats: ['standard', 'standard'],
  material: 'aluminium',
  vehicleType: 'car',
  price: 0,
  isOpenToOffers: true,
  description: '',
  photos: [],
  promoCode: '',
  boostType: 'none',
};

const STORAGE_KEY = 'ausplates_listing_draft';

// ============================================
// CONSTANTS
// ============================================

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'numeric',
  'prestige', 'deluxe', 'liquid_metal', 'frameless', 'signature',
  'afl_team', 'fishing', 'business', 'sequential', 'car_brand',
];

const SIZE_FORMATS: PlateSizeFormat[] = [
  'standard', 'slimline', 'euro', 'square', 'us_style', 'jdm', 'motorcycle',
];

const MATERIALS: PlateMaterial[] = ['aluminium', 'acrylic', 'polycarbonate', 'enamel'];

const COMMON_COLOR_SCHEMES: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black', 'yellow_on_black', 'green_on_white',
];

const ALL_COLOR_SCHEMES: PlateColorScheme[] = [
  ...COMMON_COLOR_SCHEMES,
  'maroon_on_white', 'white_on_blue', 'white_on_maroon',
  'red_on_white', 'pink_on_white', 'purple_on_white',
  'orange_on_white', 'grey_on_black', 'teal_on_white', 'ocean_blue_on_white',
  'sky_blue_on_white', 'navy_on_white', 'lime_on_white', 'forest_green_on_white',
  'burgundy_on_white', 'fire_red_on_white', 'charcoal_on_white', 'brown_on_white',
  'tan_on_black', 'cream_on_black', 'off_white_on_black',
  'matte_black_on_white', 'matte_white_on_black',
];

const COLOR_SCHEME_NAMES: Record<string, string> = {
  white_on_black: 'White on Black',
  black_on_white: 'Black on White',
  blue_on_white: 'Blue on White',
  black_on_yellow: 'Black on Yellow',
  silver_on_black: 'Silver on Black',
  gold_on_black: 'Gold on Black',
  yellow_on_black: 'Yellow on Black',
  green_on_white: 'Green on White',
  maroon_on_white: 'Maroon on White',
  white_on_blue: 'White on Blue',
  white_on_maroon: 'White on Maroon',
  red_on_white: 'Red on White',
  pink_on_white: 'Pink on White',
  purple_on_white: 'Purple on White',
  orange_on_white: 'Orange on White',
  grey_on_black: 'Grey on Black',
  teal_on_white: 'Teal on White',
  ocean_blue_on_white: 'Ocean Blue',
  sky_blue_on_white: 'Sky Blue',
  navy_on_white: 'Navy on White',
  lime_on_white: 'Lime on White',
  forest_green_on_white: 'Forest Green',
  burgundy_on_white: 'Burgundy',
  fire_red_on_white: 'Fire Red',
  charcoal_on_white: 'Charcoal',
  brown_on_white: 'Brown on White',
  tan_on_black: 'Tan on Black',
  cream_on_black: 'Cream on Black',
  off_white_on_black: 'Off White',
  matte_black_on_white: 'Matte Black',
  matte_white_on_black: 'Matte White',
};

const STEPS = [
  { id: 1, name: 'Plate Details', shortName: 'Details' },
  { id: 2, name: 'Appearance', shortName: 'Style' },
  { id: 3, name: 'Pricing', shortName: 'Price' },
  { id: 4, name: 'Photos', shortName: 'Photos' },
  { id: 5, name: 'Review & Pay', shortName: 'Pay' },
];

// ============================================
// STEP COMPONENTS
// ============================================

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <li key={step.id} className="relative flex-1">
            {index > 0 && (
              <div
                className={`absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -ml-1/2 ${
                  step.id <= currentStep ? 'bg-[var(--green)]' : 'bg-[var(--border)]'
                }`}
                style={{ width: 'calc(100% - 2rem)', left: '-50%', marginLeft: '1rem' }}
              />
            )}
            <button
              onClick={() => step.id < currentStep && onStepClick(step.id)}
              disabled={step.id > currentStep}
              className={`relative flex flex-col items-center group ${
                step.id > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step.id < currentStep
                    ? 'bg-[var(--green)] text-white'
                    : step.id === currentStep
                    ? 'bg-[var(--green)] text-white ring-4 ring-[var(--green)]/20'
                    : 'bg-[var(--background-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${
                step.id === currentStep ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'
              }`}>
                {step.name}
              </span>
              <span className={`mt-2 text-xs font-medium sm:hidden ${
                step.id === currentStep ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'
              }`}>
                {step.shortName}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StickyPlatePreview({ draft }: { draft: ListingDraft }) {
  if (!draft.combination) {
    return (
      <div className="bg-[var(--background-subtle)] rounded-xl p-8 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Enter a plate combination to see preview</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-subtle)] rounded-xl p-8 flex flex-col items-center justify-center">
      <PlateView
        combination={draft.combination}
        state={draft.state || 'VIC'}
        colorScheme={draft.colorScheme}
        size="large"
      />
      {draft.state && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          {draft.state} • {draft.plateType ? PLATE_TYPE_NAMES[draft.plateType] : 'Select type'}
        </p>
      )}
    </div>
  );
}

// Step 1: Plate Details
function Step1PlateDetails({
  draft,
  onChange,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="combination" className="block text-sm font-medium text-[var(--text)] mb-2">
          Plate Combination <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="combination"
          value={draft.combination}
          onChange={(e) => onChange({ combination: e.target.value.toUpperCase().slice(0, 10) })}
          placeholder="e.g. LEGEND"
          maxLength={10}
          className="w-full px-4 py-3 text-2xl font-mono tracking-wider uppercase border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
        />
        <p className="mt-1 text-sm text-[var(--text-muted)]">2-10 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          State <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {STATES.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => onChange({ state })}
              className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                draft.state === state
                  ? 'bg-[var(--green)] text-white border-[var(--green)]'
                  : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Plate Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ plateType: type })}
              className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                draft.plateType === type
                  ? 'bg-[var(--green)] text-white border-[var(--green)]'
                  : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              {PLATE_TYPE_NAMES[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: Appearance
function Step2Appearance({
  draft,
  onChange,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
}) {
  const [showAllColors, setShowAllColors] = useState(false);
  const displayedColors = showAllColors ? ALL_COLOR_SCHEMES : COMMON_COLOR_SCHEMES;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {displayedColors.map((scheme) => {
            const colors = COLOR_SCHEME_COLORS[scheme];
            return (
              <button
                key={scheme}
                type="button"
                onClick={() => onChange({ colorScheme: scheme })}
                className={`relative p-2 rounded-xl border-2 transition-colors ${
                  draft.colorScheme === scheme
                    ? 'border-[var(--green)]'
                    : 'border-transparent hover:border-[var(--border)]'
                }`}
                title={COLOR_SCHEME_NAMES[scheme] || scheme}
              >
                <div
                  className="w-full aspect-[2/1] rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: colors?.background, color: colors?.text }}
                >
                  AB
                </div>
                {draft.colorScheme === scheme && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--green)] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowAllColors(!showAllColors)}
          className="mt-2 text-sm text-[var(--green)] hover:underline"
        >
          {showAllColors ? 'Show fewer colors' : `Show all colors (${ALL_COLOR_SCHEMES.length})`}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Size Format (Front / Rear)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Front</p>
            <select
              value={draft.sizeFormats[0]}
              onChange={(e) => onChange({ sizeFormats: [e.target.value as PlateSizeFormat, draft.sizeFormats[1]] })}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
            >
              {SIZE_FORMATS.map((format) => (
                <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Rear</p>
            <select
              value={draft.sizeFormats[1]}
              onChange={(e) => onChange({ sizeFormats: [draft.sizeFormats[0], e.target.value as PlateSizeFormat] })}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
            >
              {SIZE_FORMATS.map((format) => (
                <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Material
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MATERIALS.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => onChange({ material: mat })}
              className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                draft.material === mat
                  ? 'bg-[var(--green)] text-white border-[var(--green)]'
                  : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              {PLATE_MATERIAL_NAMES[mat]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Vehicle Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['car', 'motorcycle'] as VehicleType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ vehicleType: type })}
              className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                draft.vehicleType === type
                  ? 'bg-[var(--green)] text-white border-[var(--green)]'
                  : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              {type === 'car' ? 'Car' : 'Motorcycle'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Pricing & Details
function Step3Pricing({
  draft,
  onChange,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-[var(--text)] mb-2">
          Asking Price (AUD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
          <input
            type="number"
            id="price"
            value={draft.price || ''}
            onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min={100}
            className="w-full pl-8 pr-4 py-3 text-2xl border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
          />
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Minimum $100</p>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isOpenToOffers}
            onChange={(e) => onChange({ isOpenToOffers: e.target.checked })}
            className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
          />
          <span className="text-sm font-medium text-[var(--text)]">Open to offers</span>
        </label>
        <p className="mt-1 ml-8 text-sm text-[var(--text-muted)]">
          Let buyers know you&apos;re willing to negotiate
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--text)] mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value.slice(0, 1000) })}
          placeholder="Tell buyers about your plate..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none"
        />
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {draft.description.length}/1000 characters
        </p>
      </div>
    </div>
  );
}

// Step 4: Photos
function Step4Photos({
  draft,
  onChange,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For now, just create object URLs (real implementation would upload to Supabase)
    setIsUploading(true);
    try {
      const newPhotos: string[] = [];
      for (const file of Array.from(files)) {
        if (draft.photos.length + newPhotos.length >= 5) break;
        const url = URL.createObjectURL(file);
        newPhotos.push(url);
      }
      onChange({ photos: [...draft.photos, ...newPhotos] });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...draft.photos];
    newPhotos.splice(index, 1);
    onChange({ photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Photos (optional, max 5)
        </label>

        {/* Photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {draft.photos.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--background-subtle)]">
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                aria-label={`Remove photo ${index + 1}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {draft.photos.length < 5 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--green)] transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="sr-only"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="w-8 h-8 border-2 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="mt-2 text-sm text-[var(--text-muted)]">Add photo</span>
                </>
              )}
            </label>
          )}
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          Photos help buyers see the actual condition. JPG or PNG, max 5MB each.
        </p>
      </div>
    </div>
  );
}

// Step 5: Review & Pay
function Step5Review({
  draft,
  onChange,
  isCreatingListing,
  onCreateListing,
  error,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
  isCreatingListing: boolean;
  onCreateListing: () => void;
  error: string | null;
}) {
  const listingFee = 999; // $9.99 in cents
  const boost7DayTotal = 1998; // $19.98 (listing + 7-day boost)
  const boost30DayTotal = 2499; // $24.99 (listing + 30-day boost - best value)

  const getTotal = () => {
    if (draft.boostType === '7day') return boost7DayTotal;
    if (draft.boostType === '30day') return boost30DayTotal;
    return listingFee;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-[var(--background-subtle)] rounded-xl p-6">
        <h3 className="font-semibold text-[var(--text)] mb-4">Listing Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">Plate</dt>
            <dd className="font-medium text-[var(--text)]">{draft.combination}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">State</dt>
            <dd className="font-medium text-[var(--text)]">{draft.state}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">Type</dt>
            <dd className="font-medium text-[var(--text)]">{draft.plateType && PLATE_TYPE_NAMES[draft.plateType]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">Price</dt>
            <dd className="font-medium text-[var(--text)]">${draft.price.toLocaleString()}</dd>
          </div>
          {draft.isOpenToOffers && (
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Offers</dt>
              <dd className="font-medium text-[var(--green)]">Open to offers</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Promo Code */}
      <div>
        <label htmlFor="promo" className="block text-sm font-medium text-[var(--text)] mb-2">
          Promo Code (optional)
        </label>
        <input
          type="text"
          id="promo"
          value={draft.promoCode}
          onChange={(e) => onChange({ promoCode: e.target.value.toUpperCase() })}
          placeholder="Enter code"
          className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent uppercase"
        />
      </div>

      {/* Boost Options */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-3">
          Boost Your Listing
        </label>
        <div className="space-y-3">
          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            draft.boostType === 'none' ? 'border-[var(--green)] bg-[var(--green)]/5' : 'border-[var(--border)]'
          }`}>
            <input
              type="radio"
              name="boost"
              checked={draft.boostType === 'none'}
              onChange={() => onChange({ boostType: 'none' })}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium text-[var(--text)]">Standard Listing</p>
              <p className="text-sm text-[var(--text-muted)]">Basic listing on AusPlates</p>
            </div>
            <span className="font-medium text-[var(--text)]">$9.99</span>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            draft.boostType === '7day' ? 'border-[var(--green)] bg-[var(--green)]/5' : 'border-[var(--border)]'
          }`}>
            <input
              type="radio"
              name="boost"
              checked={draft.boostType === '7day'}
              onChange={() => onChange({ boostType: '7day' })}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium text-[var(--text)]">7-Day Boost</p>
              <p className="text-sm text-[var(--text-muted)]">Featured for 7 days, 3x more views</p>
            </div>
            <span className="font-medium text-[var(--text)]">$19.98</span>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors relative ${
            draft.boostType === '30day' ? 'border-[var(--green)] bg-[var(--green)]/5' : 'border-[var(--border)]'
          }`}>
            <span className="absolute -top-2 right-4 px-2 py-0.5 bg-[var(--gold)] text-xs font-semibold rounded">BEST VALUE</span>
            <input
              type="radio"
              name="boost"
              checked={draft.boostType === '30day'}
              onChange={() => onChange({ boostType: '30day' })}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium text-[var(--text)]">30-Day Boost</p>
              <p className="text-sm text-[var(--text-muted)]">30 days featured, priority placement</p>
            </div>
            <span className="font-medium text-[var(--text)]">$24.99</span>
          </label>
        </div>
      </div>

      {/* Total */}
      <div className="bg-[var(--text)] text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <span className="text-lg">Total</span>
          <span className="text-2xl font-bold">${(getTotal() / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Continue to Payment Button */}
      <button
        type="button"
        onClick={onCreateListing}
        disabled={isCreatingListing}
        className="w-full py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isCreatingListing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redirecting to Payment...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Continue to Secure Payment
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--text-muted)]">
        You&apos;ll be redirected to Stripe for secure payment. By listing, you agree to our Terms of Service and confirm this plate is legally transferable.
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<ListingDraft>(INITIAL_DRAFT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  // Check for cancelled payment return
  const wasCancelled = searchParams.get('cancelled') === 'true';

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDraft({ ...INITIAL_DRAFT, ...parsed });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save draft to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/create');
    }
  }, [authLoading, isAuthenticated, router]);

  const updateDraft = useCallback((updates: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return draft.combination.length >= 2 && draft.state !== null && draft.plateType !== null;
      case 2:
        return true; // All optional
      case 3:
        return draft.price >= 100;
      case 4:
        return true; // Photos optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create listing and redirect to Stripe Checkout
  const handleCreateListing = async () => {
    if (!draft.state || !draft.plateType) return;

    setIsCreatingListing(true);
    setSubmitError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create the listing (as draft)
      const listing = await createListing(token, {
        combination: draft.combination,
        state: draft.state,
        plateType: draft.plateType,
        colorScheme: draft.colorScheme,
        sizeFormats: draft.sizeFormats,
        material: draft.material,
        vehicleType: draft.vehicleType,
        price: draft.price * 100, // Convert to cents
        isOpenToOffers: draft.isOpenToOffers,
        description: draft.description,
        // TODO: Upload photos to Supabase and pass URLs
        photoUrls: undefined,
      });

      // Create Stripe Checkout Session
      const checkoutResult = await createCheckout(
        token,
        listing.id,
        draft.boostType,
        draft.promoCode || undefined
      );

      // If free (promo code covered full amount), redirect to listing
      if (checkoutResult.free && checkoutResult.listingSlug) {
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/plate/${checkoutResult.listingSlug}?created=true`);
        return;
      }

      // Redirect to Stripe Checkout
      if (checkoutResult.checkoutUrl) {
        // Keep draft in localStorage so user can resume if they cancel
        window.location.href = checkoutResult.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Create listing error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsCreatingListing(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text)]">List Your Plate</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              {currentStep === 1 && <Step1PlateDetails draft={draft} onChange={updateDraft} />}
              {currentStep === 2 && <Step2Appearance draft={draft} onChange={updateDraft} />}
              {currentStep === 3 && <Step3Pricing draft={draft} onChange={updateDraft} />}
              {currentStep === 4 && <Step4Photos draft={draft} onChange={updateDraft} />}
              {currentStep === 5 && (
                <Step5Review
                  draft={draft}
                  onChange={updateDraft}
                  isCreatingListing={isCreatingListing}
                  onCreateListing={handleCreateListing}
                  error={submitError || (wasCancelled ? 'Payment was cancelled. You can try again.' : null)}
                />
              )}

              {/* Navigation */}
              {currentStep < 5 && (
                <div className="flex gap-4 mt-8">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Preview - Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <StickyPlatePreview draft={draft} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview - Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] p-4">
        <StickyPlatePreview draft={draft} />
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateListingContent />
    </Suspense>
  );
}
