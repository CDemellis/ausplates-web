'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { PlateView } from '@/components/PlateView';
import { createListing, createCheckout, confirmPayment, uploadPhoto, deletePhoto } from '@/lib/api';

import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
  PlateMaterial,
  VehicleType,
  ContactPreference,
  PLATE_TYPE_NAMES,
  SIZE_FORMAT_NAMES,
  PLATE_MATERIAL_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// ============================================
// STRIPE SETUP
// ============================================

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ============================================
// TYPES
// ============================================

type Step = 'plan' | 'details' | 'pay';
type BoostType = 'none' | '7day' | '30day';

interface ListingDraft {
  step: Step;
  boostType: BoostType;
  // Plate Details
  combination: string;
  state: AustralianState | null;
  plateType: PlateType | null;
  colorScheme: PlateColorScheme;
  // Optional Details (collapsible section)
  sizeFormats: [PlateSizeFormat, PlateSizeFormat];
  material: PlateMaterial;
  vehicleType: VehicleType;
  contactPreference: ContactPreference;
  // Pricing
  price: number;
  isOpenToOffers: boolean;
  description: string;
  // Photos
  photos: string[];
  // Promo
  promoCode: string;
  // Timestamp
  savedAt: number;
}

interface FormErrors {
  combination?: string;
  state?: string;
  plateType?: string;
  price?: string;
  description?: string;
  photos?: string;
}

const INITIAL_DRAFT: ListingDraft = {
  step: 'plan',
  boostType: 'none',
  combination: '',
  state: null,
  plateType: null,
  colorScheme: 'white_on_black',
  sizeFormats: ['standard', 'standard'],
  material: 'aluminium',
  vehicleType: 'car',
  contactPreference: 'in_app_only',
  price: 0,
  isOpenToOffers: true,
  description: '',
  photos: [],
  promoCode: '',
  savedAt: Date.now(),
};

const STORAGE_KEY = 'ausplates_listing_draft';
const DRAFT_EXPIRY_DAYS = 7;

// ============================================
// CONSTANTS
// ============================================

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const COMMON_PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'prestige',
];

const ALL_PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'numeric',
  'prestige', 'deluxe', 'liquid_metal', 'frameless', 'signature',
  'afl_team', 'fishing', 'business', 'sequential', 'car_brand',
];

const SIZE_FORMATS: PlateSizeFormat[] = [
  'standard', 'slimline', 'euro', 'square', 'us_style', 'jdm', 'motorcycle',
];

const MATERIALS: PlateMaterial[] = ['aluminium', 'acrylic', 'polycarbonate', 'enamel'];

const COMMON_COLORS: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black',
];

const ALL_COLORS: PlateColorScheme[] = [
  ...COMMON_COLORS,
  'yellow_on_black', 'green_on_white', 'maroon_on_white',
  'red_on_white', 'pink_on_white', 'purple_on_white',
  'orange_on_white', 'grey_on_black', 'teal_on_white',
  'ocean_blue_on_white', 'sky_blue_on_white', 'navy_on_white',
];

const TIER_PRICES = {
  none: 999,     // $9.99
  '7day': 1998,  // $19.98
  '30day': 2499, // $24.99
} as const;

const TIER_INFO: Record<BoostType, { name: string; features: string[] }> = {
  none: {
    name: 'Standard',
    features: ['Listed until sold', 'Secure messaging'],
  },
  '7day': {
    name: 'Boost',
    features: ['Featured 7 days', 'Priority search', 'Homepage spotlight'],
  },
  '30day': {
    name: 'Boost Pro',
    features: ['Featured 30 days', 'Priority search', '2x Bump to top'],
  },
};

const MAX_PHOTOS = 5;

// ============================================
// HELPER COMPONENTS
// ============================================

function Check({ included, highlight }: { included: boolean; highlight?: boolean }) {
  if (!included) {
    return <span className="w-5 h-5 text-[var(--text-muted)]">—</span>;
  }
  return (
    <svg
      className={`w-5 h-5 ${highlight ? 'text-[var(--gold)]' : 'text-[var(--green)]'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function Star() {
  return (
    <svg className="w-4 h-4 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ============================================
// STEP 1: PLAN SELECTION
// ============================================

function Step1Plan({
  boostType,
  onSelect,
  onContinue,
}: {
  boostType: BoostType | null;
  onSelect: (type: BoostType) => void;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-5xl w-full mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          Choose Your Listing Plan
        </h1>
        <p className="text-[var(--text-secondary)]">
          Get your plate in front of thousands of buyers
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Standard */}
        <button
          onClick={() => onSelect('none')}
          className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
            boostType === 'none'
              ? 'border-[var(--green)] shadow-xl scale-[1.02]'
              : 'border-[var(--border)] hover:border-[var(--green)] hover:shadow-lg'
          }`}
        >
          <div className="p-6 pb-4">
            <h3 className="text-xl font-bold text-[var(--text)] mb-1">Standard</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Basic listing</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[var(--text)]">$9.99</span>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Listed until sold</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Up to 5 photos</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Secure messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included={false} />
              <span className="text-sm text-[var(--text-muted)]">Featured badge</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included={false} />
              <span className="text-sm text-[var(--text-muted)]">Priority in search</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included={false} />
              <span className="text-sm text-[var(--text-muted)]">Homepage spotlight</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included={false} />
              <span className="text-sm text-[var(--text-muted)]">View statistics</span>
            </div>
          </div>
          {boostType === 'none' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-[var(--green)] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>

        {/* Boost - 7 Day */}
        <button
          onClick={() => onSelect('7day')}
          className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
            boostType === '7day'
              ? 'border-[var(--green)] shadow-xl scale-[1.02]'
              : 'border-[var(--border)] hover:border-[var(--green)] hover:shadow-lg'
          }`}
        >
          <div className="absolute -top-0 left-0 right-0">
            <div className="bg-[var(--green)] text-white text-xs font-bold text-center py-1">
              POPULAR
            </div>
          </div>
          <div className="p-6 pb-4 pt-10">
            <div className="flex items-center gap-2 mb-1">
              <Star />
              <h3 className="text-xl font-bold text-[var(--text)]">Boost</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">7 days of visibility</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[var(--text)]">$19.98</span>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Listed until sold</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Up to 5 photos</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Secure messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Featured badge (7 days)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Priority in search</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Homepage spotlight</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">View statistics</span>
            </div>
          </div>
          {boostType === '7day' && (
            <div className="absolute top-10 right-4 w-6 h-6 bg-[var(--green)] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>

        {/* Boost Pro - 30 Day */}
        <button
          onClick={() => onSelect('30day')}
          className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
            boostType === '30day'
              ? 'border-[var(--gold)] shadow-xl scale-[1.02] ring-4 ring-[var(--gold)]/20'
              : 'border-[var(--border)] hover:border-[var(--gold)] hover:shadow-lg'
          }`}
        >
          <div className="absolute -top-0 left-0 right-0">
            <div className="bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black text-xs font-bold text-center py-1">
              BEST VALUE — UNDER $1/DAY
            </div>
          </div>
          <div className="p-6 pb-4 pt-10">
            <div className="flex items-center gap-2 mb-1">
              <Star />
              <Star />
              <h3 className="text-xl font-bold text-[var(--text)]">Boost Pro</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">30 days maximum exposure</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[var(--text)]">$24.99</span>
              <span className="text-sm text-[var(--text-muted)]">$0.83/day</span>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Listed until sold</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Up to 5 photos</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included />
              <span className="text-sm text-[var(--text-secondary)]">Secure messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Featured badge (30 days)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Priority in search</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">Homepage spotlight</span>
            </div>
            <div className="flex items-center gap-3">
              <Check included highlight />
              <span className="text-sm font-medium text-[var(--text)]">View statistics</span>
            </div>
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--gold)] font-semibold mb-2">PRO EXCLUSIVE</p>
              <div className="flex items-center gap-3">
                <Check included highlight />
                <span className="text-sm font-medium text-[var(--text)]">2x Bump to top</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Check included highlight />
                <span className="text-sm font-medium text-[var(--text)]">Price drop alerts</span>
              </div>
            </div>
          </div>
          {boostType === '30day' && (
            <div className="absolute top-10 right-4 w-6 h-6 bg-[var(--gold)] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Continue Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onContinue}
          disabled={boostType === null}
          className="px-12 py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payment
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No commission on sale
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Instant listing
        </span>
      </div>
    </div>
  );
}

// ============================================
// STEP 2: LISTING DETAILS
// ============================================

function Step2Details({
  draft,
  onChange,
  errors,
  onBack,
  onContinue,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
  errors: FormErrors;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { getAccessToken } = useAuth();
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllPlateTypes, setShowAllPlateTypes] = useState(false);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedColors = showAllColors ? ALL_COLORS : COMMON_COLORS;
  const displayedPlateTypes = showAllPlateTypes ? ALL_PLATE_TYPES : COMMON_PLATE_TYPES;

  // Photo upload handlers
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const newPhotos: string[] = [];
      const remaining = MAX_PHOTOS - draft.photos.length;

      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith('image/')) continue;
        const result = await uploadPhoto(token, file);
        newPhotos.push(result.url);
      }

      onChange({ photos: [...draft.photos, ...newPhotos] });
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  }, [draft.photos, getAccessToken, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removePhoto = useCallback(async (index: number) => {
    const url = draft.photos[index];
    const newPhotos = draft.photos.filter((_, i) => i !== index);
    onChange({ photos: newPhotos });

    // Try to delete from storage (fire and forget)
    try {
      const token = await getAccessToken();
      if (token && url) {
        await deletePhoto(token, url);
      }
    } catch {
      // Ignore deletion errors
    }
  }, [draft.photos, onChange, getAccessToken]);

  const borderClass = draft.boostType === '30day'
    ? 'border-[var(--gold)] shadow-lg shadow-amber-100'
    : draft.boostType === '7day'
    ? 'border-[var(--green)] shadow-lg shadow-green-100'
    : 'border-[var(--border)]';

  return (
    <div className="max-w-2xl w-full mx-auto">
      <div className={`bg-white rounded-2xl p-6 border-2 ${borderClass}`}>
        {/* Tier badge */}
        {draft.boostType !== 'none' && (
          <div className="flex justify-end mb-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              draft.boostType === '30day'
                ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                : 'bg-[var(--green)] text-white'
            }`}>
              <Star />
              {TIER_INFO[draft.boostType].name}
            </div>
          </div>
        )}

        {/* Combination with inline preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Plate Combination <span className="text-[var(--error)]">*</span>
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={draft.combination}
              onChange={(e) => onChange({ combination: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })}
              placeholder="e.g. LEGEND"
              maxLength={10}
              className={`flex-1 px-4 py-3 text-xl font-mono tracking-wider uppercase border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent ${
                errors.combination ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
              autoFocus
            />
            {draft.combination && (
              <div className="flex-shrink-0">
                <PlateView
                  combination={draft.combination}
                  state={draft.state || 'VIC'}
                  colorScheme={draft.colorScheme}
                  size="small"
                />
              </div>
            )}
          </div>
          {errors.combination ? (
            <p className="mt-1 text-sm text-[var(--error)]">{errors.combination}</p>
          ) : (
            <p className="mt-1 text-sm text-[var(--text-muted)]">2-10 letters and numbers</p>
          )}
        </div>

        {/* State & Type Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              State <span className="text-[var(--error)]">*</span>
            </label>
            <select
              value={draft.state || ''}
              onChange={(e) => onChange({ state: e.target.value as AustralianState })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] ${
                errors.state ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-[var(--error)]">{errors.state}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Plate Type <span className="text-[var(--error)]">*</span>
            </label>
            <select
              value={draft.plateType || ''}
              onChange={(e) => onChange({ plateType: e.target.value as PlateType })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] ${
                errors.plateType ? 'border-[var(--error)]' : 'border-[var(--border)]'
              }`}
            >
              <option value="">Select type</option>
              {displayedPlateTypes.map((type) => (
                <option key={type} value={type}>{PLATE_TYPE_NAMES[type]}</option>
              ))}
            </select>
            {!showAllPlateTypes && (
              <button
                type="button"
                onClick={() => setShowAllPlateTypes(true)}
                className="mt-1 text-xs text-[var(--green)] hover:underline"
              >
                Show all types
              </button>
            )}
            {errors.plateType && (
              <p className="mt-1 text-sm text-[var(--error)]">{errors.plateType}</p>
            )}
          </div>
        </div>

        {/* Color Scheme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Color Scheme
          </label>
          <div className="flex flex-wrap gap-2">
            {displayedColors.map((scheme) => {
              const colors = COLOR_SCHEME_COLORS[scheme];
              return (
                <button
                  key={scheme}
                  type="button"
                  onClick={() => onChange({ colorScheme: scheme })}
                  className={`p-2 rounded-xl border-2 transition-all ${
                    draft.colorScheme === scheme
                      ? 'border-[var(--green)] scale-105'
                      : 'border-[var(--border)] hover:border-[var(--green)]'
                  }`}
                >
                  <div
                    className="w-12 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: colors?.background, color: colors?.text }}
                  >
                    AB
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowAllColors(!showAllColors)}
            className="mt-2 text-sm text-[var(--green)] hover:underline"
          >
            {showAllColors ? 'Show fewer colors' : 'Show more colors'}
          </button>
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Photos <span className="text-[var(--text-muted)] font-normal">({draft.photos.length}/{MAX_PHOTOS})</span>
          </label>

          {draft.photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {draft.photos.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image
                    src={url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {draft.photos.length < MAX_PHOTOS && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[var(--green)] bg-green-50'
                  : 'border-[var(--border)] hover:border-[var(--green)] hover:bg-[var(--background-subtle)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="w-8 h-8 mx-auto border-2 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {isDragging ? 'Drop photos here' : 'Drag photos here or click to browse'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {MAX_PHOTOS - draft.photos.length} photo{MAX_PHOTOS - draft.photos.length !== 1 ? 's' : ''} remaining
                  </p>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-[var(--error)]">{uploadError}</p>
          )}
          {errors.photos && (
            <p className="mt-2 text-sm text-[var(--error)]">{errors.photos}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)] my-6" />

        {/* Price */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Asking Price <span className="text-[var(--error)]">*</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[var(--text-muted)]">$</span>
              <input
                type="number"
                value={draft.price || ''}
                onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min={100}
                max={10000000}
                className={`w-full pl-10 pr-4 py-3 text-xl font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent ${
                  errors.price ? 'border-[var(--error)]' : 'border-[var(--border)]'
                }`}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isOpenToOffers}
                onChange={(e) => onChange({ isOpenToOffers: e.target.checked })}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Open to offers</span>
            </label>
          </div>
          {errors.price ? (
            <p className="mt-1 text-sm text-[var(--error)]">{errors.price}</p>
          ) : (
            <p className="mt-1 text-xs text-[var(--text-muted)]">Minimum $100</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Description <span className="text-[var(--text-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 1000) })}
            placeholder="Tell buyers about your plate..."
            rows={3}
            maxLength={1000}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none ${
              errors.description ? 'border-[var(--error)]' : 'border-[var(--border)]'
            }`}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {draft.description.length}/1000 characters
          </p>
          {errors.description && (
            <p className="mt-1 text-sm text-[var(--error)]">{errors.description}</p>
          )}
        </div>

        {/* More details (collapsible) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMoreDetailsOpen(!moreDetailsOpen)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--text)] hover:text-[var(--green)] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${moreDetailsOpen ? 'rotate-180' : ''}`} />
            More details <span className="text-[var(--text-muted)] font-normal">(optional)</span>
          </button>

          {moreDetailsOpen && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-[var(--border)]">
              {/* Size Format */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Size Format (Front / Rear)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Front</p>
                    <select
                      value={draft.sizeFormats[0]}
                      onChange={(e) => onChange({ sizeFormats: [e.target.value as PlateSizeFormat, draft.sizeFormats[1]] })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                    >
                      {SIZE_FORMATS.map((format) => (
                        <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Rear</p>
                    <select
                      value={draft.sizeFormats[1]}
                      onChange={(e) => onChange({ sizeFormats: [draft.sizeFormats[0], e.target.value as PlateSizeFormat] })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                    >
                      {SIZE_FORMATS.map((format) => (
                        <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Material
                </label>
                <select
                  value={draft.material}
                  onChange={(e) => onChange({ material: e.target.value as PlateMaterial })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                >
                  {MATERIALS.map((mat) => (
                    <option key={mat} value={mat}>{PLATE_MATERIAL_NAMES[mat]}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Vehicle Type
                </label>
                <select
                  value={draft.vehicleType}
                  onChange={(e) => onChange({ vehicleType: e.target.value as VehicleType })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Contact Preference
                </label>
                <select
                  value={draft.contactPreference}
                  onChange={(e) => onChange({ contactPreference: e.target.value as ContactPreference })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                >
                  <option value="in_app_only">In-app messaging only</option>
                  <option value="phone_ok">Phone calls OK</option>
                  <option value="email_ok">Email OK</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            Review & Pay
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT FORM (STRIPE ELEMENTS)
// ============================================

function PaymentForm({
  amount,
  onSuccess,
  onError,
  paymentIntentId,
}: {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { getAccessToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/create/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const token = await getAccessToken();
        if (token) {
          await confirmPayment(token, paymentIntentId);
        }
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-xl p-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ${(amount / 100).toFixed(2)} AUD
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--text-muted)]">
        Your payment is secure and encrypted by Stripe.
      </p>
    </form>
  );
}

// ============================================
// STEP 3: REVIEW & PAY
// ============================================

function Step3Pay({
  draft,
  onChange,
  onBack,
  isCreatingListing,
  onCreateListing,
  error,
  clientSecret,
  paymentIntentId,
  paymentAmount,
  onPaymentSuccess,
  onPaymentError,
  isValidatingPromo,
  promoValidation,
  onApplyPromo,
  setPromoValidation,
}: {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
  onBack: () => void;
  isCreatingListing: boolean;
  onCreateListing: () => void;
  error: string | null;
  clientSecret: string | null;
  paymentIntentId: string | null;
  paymentAmount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  isValidatingPromo: boolean;
  promoValidation: { valid: boolean; message: string } | null;
  onApplyPromo: () => void;
  setPromoValidation: (v: { valid: boolean; message: string } | null) => void;
}) {
  const borderClass = draft.boostType === '30day'
    ? 'border-[var(--gold)] shadow-lg shadow-amber-100'
    : draft.boostType === '7day'
    ? 'border-[var(--green)] shadow-lg shadow-green-100'
    : 'border-[var(--border)]';

  const basePrice = TIER_PRICES[draft.boostType];
  // If promo is valid, price is $0
  const total = promoValidation?.valid ? 0 : basePrice;

  // If we have clientSecret, show Stripe payment form
  if (clientSecret && paymentIntentId) {
    return (
      <div className="max-w-lg w-full mx-auto">
        <div className={`bg-white rounded-2xl overflow-hidden border-2 ${borderClass}`}>
          {/* Plate Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center relative">
            {draft.boostType !== 'none' && (
              <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                draft.boostType === '30day'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                  : 'bg-[var(--green)] text-white'
              }`}>
                <Star />
                {TIER_INFO[draft.boostType].name}
              </div>
            )}
            <PlateView
              combination={draft.combination}
              state={draft.state || 'VIC'}
              colorScheme={draft.colorScheme}
              size="medium"
            />
            <p className="mt-3 text-white/60 text-sm">
              {draft.state} • {draft.plateType && PLATE_TYPE_NAMES[draft.plateType]}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            )}

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#00843D',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <PaymentForm
                amount={paymentAmount}
                onSuccess={onPaymentSuccess}
                onError={onPaymentError}
                paymentIntentId={paymentIntentId}
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  // Initial review & pay screen
  return (
    <div className="max-w-lg w-full mx-auto">
      <div className={`bg-white rounded-2xl overflow-hidden border-2 ${borderClass}`}>
        {/* Plate Preview */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center relative">
          {draft.boostType !== 'none' && (
            <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              draft.boostType === '30day'
                ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                : 'bg-[var(--green)] text-white'
            }`}>
              <Star />
              {TIER_INFO[draft.boostType].name}
            </div>
          )}
          <PlateView
            combination={draft.combination}
            state={draft.state || 'VIC'}
            colorScheme={draft.colorScheme}
            size="medium"
          />
          <p className="mt-3 text-white/60 text-sm">
            {draft.state} • {draft.plateType && PLATE_TYPE_NAMES[draft.plateType]}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Your Asking Price</span>
            <span className="font-semibold text-[var(--text)]">${draft.price.toLocaleString()}</span>
          </div>

          {draft.isOpenToOffers && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Offers</span>
              <span className="font-medium text-[var(--green)]">Open to offers</span>
            </div>
          )}

          {/* Promo Code */}
          <div className="pt-4 border-t border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft.promoCode}
                onChange={(e) => {
                  onChange({ promoCode: e.target.value.toUpperCase() });
                  // Clear validation when code changes
                  if (promoValidation) setPromoValidation(null);
                }}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent uppercase"
              />
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={!draft.promoCode || isValidatingPromo}
                className="px-4 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingPromo ? '...' : 'Apply'}
              </button>
            </div>
            {promoValidation && (
              <p className={`mt-2 text-sm ${promoValidation.valid ? 'text-[var(--green)]' : 'text-[var(--error)]'}`}>
                {promoValidation.message}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[var(--text)] font-medium">Listing Fee</span>
                {draft.boostType !== 'none' && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {draft.boostType === '30day' ? '30 days featured' : '7 days featured'}
                  </p>
                )}
              </div>
              <div className="text-right">
                {promoValidation?.valid ? (
                  <>
                    <span className="text-lg text-[var(--text-muted)] line-through mr-2">${(basePrice / 100).toFixed(2)}</span>
                    <span className="text-2xl font-bold text-[var(--green)]">$0.00</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[var(--text)]">${(total / 100).toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onCreateListing}
              disabled={isCreatingListing}
              className="flex-1 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:bg-[#006B31] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCreatingListing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {promoValidation?.valid ? 'Publishing...' : 'Preparing...'}
                </>
              ) : promoValidation?.valid ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Publish Free
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay ${(total / 100).toFixed(2)}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-[var(--text-muted)]">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function CreateListingContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();

  const [draft, setDraft] = useState<ListingDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [draftInitialized, setDraftInitialized] = useState(false);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Promo validation state
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoValidation, setPromoValidation] = useState<{ valid: boolean; message: string } | null>(null);

  // Check URL for fresh=true to clear draft, or load from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fresh') === 'true') {
      localStorage.removeItem(STORAGE_KEY);
      setDraft(INITIAL_DRAFT);
      // Remove the query param from URL
      window.history.replaceState({}, '', '/create');
      setDraftInitialized(true);
      return;
    }

    // Load draft from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ListingDraft;
        // Check if draft is expired (7 days)
        const expiryMs = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.savedAt < expiryMs) {
          setDraft({ ...INITIAL_DRAFT, ...parsed });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Ignore parse errors
      }
    }
    setDraftInitialized(true);
  }, []);

  // Save draft to localStorage on changes (only after initialization)
  useEffect(() => {
    if (!draftInitialized) return;
    const toSave = { ...draft, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [draft, draftInitialized]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/create');
    }
  }, [authLoading, isAuthenticated, router]);

  const updateDraft = useCallback((updates: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    // Clear related errors when field is updated
    const errorKeys = Object.keys(updates) as (keyof FormErrors)[];
    setErrors((prev) => {
      const newErrors = { ...prev };
      errorKeys.forEach((key) => {
        if (key in newErrors) delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  const validateDetails = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (draft.combination.length < 2) {
      newErrors.combination = '2-10 letters and numbers only';
    } else if (draft.combination.length > 10) {
      newErrors.combination = 'Maximum 10 characters';
    }

    if (!draft.state) {
      newErrors.state = 'Select a state';
    }

    if (!draft.plateType) {
      newErrors.plateType = 'Select a plate type';
    }

    if (draft.price < 100) {
      newErrors.price = 'Minimum $100';
    } else if (draft.price > 10000000) {
      newErrors.price = 'Maximum $10,000,000';
    }

    if (draft.description.length > 1000) {
      newErrors.description = 'Maximum 1000 characters';
    }

    if (draft.photos.length > MAX_PHOTOS) {
      newErrors.photos = `Maximum ${MAX_PHOTOS} photos`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [draft]);

  const handlePlanContinue = useCallback(() => {
    if (draft.boostType) {
      updateDraft({ step: 'details' });
    }
  }, [draft.boostType, updateDraft]);

  const handleDetailsContinue = useCallback(() => {
    if (validateDetails()) {
      updateDraft({ step: 'pay' });
    }
  }, [validateDetails, updateDraft]);

  const handleBack = useCallback(() => {
    if (draft.step === 'details') {
      updateDraft({ step: 'plan' });
    } else if (draft.step === 'pay') {
      // Reset payment state when going back
      setClientSecret(null);
      setPaymentIntentId(null);
      setSubmitError(null);
      updateDraft({ step: 'details' });
    }
  }, [draft.step, updateDraft]);

  // Create listing and get PaymentIntent
  const handleCreateListing = async () => {
    if (!draft.state || !draft.plateType) return;

    setIsCreatingListing(true);
    setSubmitError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

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
        photoUrls: draft.photos.length > 0 ? draft.photos : undefined,
        contactPreference: draft.contactPreference,
      });

      // Clear localStorage draft now that listing is saved to DB
      // User can find their draft listing in "My Listings" if they abandon payment
      localStorage.removeItem(STORAGE_KEY);

      // Create PaymentIntent
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

      // Set up embedded payment form
      if (checkoutResult.clientSecret && checkoutResult.paymentIntentId) {
        setClientSecret(checkoutResult.clientSecret);
        setPaymentIntentId(checkoutResult.paymentIntentId);
        setPaymentAmount(checkoutResult.amount || TIER_PRICES[draft.boostType]);
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error) {
      console.error('Create listing error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsCreatingListing(false);
    }
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push('/create/success?payment=complete');
  };

  const handlePaymentError = (error: string) => {
    setSubmitError(error);
  };

  // Validate promo code
  const handleApplyPromo = async () => {
    if (!draft.promoCode) return;

    setIsValidatingPromo(true);
    setPromoValidation(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: draft.promoCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoValidation({ valid: true, message: 'Promo code applied! Your listing is free.' });
      } else {
        setPromoValidation({ valid: false, message: data.error || 'Invalid promo code' });
      }
    } catch {
      setPromoValidation({ valid: false, message: 'Failed to validate promo code' });
    } finally {
      setIsValidatingPromo(false);
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
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link
            href="/"
            className="text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm sr-only">Close</span>
          </Link>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {(['plan', 'details', 'pay'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  draft.step === s
                    ? 'w-6 bg-[var(--green)]'
                    : (['plan', 'details', 'pay'] as Step[]).indexOf(draft.step) > i
                    ? 'bg-[var(--green)]'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>

          {/* Start Fresh link - only show if draft has data */}
          {(draft.combination || draft.step !== 'plan') ? (
            <Link
              href="/create?fresh=true"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--green)] transition-colors"
            >
              Start fresh
            </Link>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        {draft.step === 'plan' && (
          <Step1Plan
            boostType={draft.boostType}
            onSelect={(type) => updateDraft({ boostType: type })}
            onContinue={handlePlanContinue}
          />
        )}

        {draft.step === 'details' && (
          <Step2Details
            draft={draft}
            onChange={updateDraft}
            errors={errors}
            onBack={handleBack}
            onContinue={handleDetailsContinue}
          />
        )}

        {draft.step === 'pay' && (
          <Step3Pay
            draft={draft}
            onChange={updateDraft}
            onBack={handleBack}
            isCreatingListing={isCreatingListing}
            onCreateListing={handleCreateListing}
            error={submitError}
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
            paymentAmount={paymentAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            isValidatingPromo={isValidatingPromo}
            promoValidation={promoValidation}
            onApplyPromo={handleApplyPromo}
            setPromoValidation={setPromoValidation}
          />
        )}
      </main>
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
