'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlateView } from '@/components/PlateView';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PLATE_TYPE_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// Prototype B: Plan First (Refined)
// - Lead with value - show pricing tiers upfront
// - Rich feature comparison
// - Makes upsell the entry point, not afterthought

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const COMMON_PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'prestige',
];

const COLORS: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black',
];

type Step = 'plan' | 'details' | 'pay';
type BoostType = 'none' | '7day' | '30day';

// Tier info for persistent reminder
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

// Feature check icon
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

// Star icon for premium features
function Star() {
  return (
    <svg className="w-4 h-4 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function PrototypeBPage() {
  const [step, setStep] = useState<Step>('plan');
  const [boostType, setBoostType] = useState<BoostType | null>(null);
  const [combination, setCombination] = useState('');
  const [state, setState] = useState<AustralianState | null>(null);
  const [plateType, setPlateType] = useState<PlateType | null>(null);
  const [colorScheme, setColorScheme] = useState<PlateColorScheme>('white_on_black');
  const [price, setPrice] = useState<number>(0);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 5;

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPhotos: { file: File; preview: string }[] = [];
    const remaining = MAX_PHOTOS - photos.length;

    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newPhotos.push({ file, preview });
      }
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
  }, [photos.length]);

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

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const getTotal = () => {
    if (boostType === '30day') return 24.99;
    if (boostType === '7day') return 19.98;
    return 9.99;
  };

  const canProceed = () => {
    if (step === 'plan') return boostType !== null;
    if (step === 'details') return combination.length >= 2 && state && plateType && price >= 100;
    return false;
  };

  const handleNext = () => {
    if (step === 'plan' && canProceed()) setStep('details');
    else if (step === 'details' && canProceed()) setStep('pay');
  };

  const handleBack = () => {
    if (step === 'details') setStep('plan');
    else if (step === 'pay') setStep('details');
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link
            href="/create/prototypes"
            className="text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {(['plan', 'details', 'pay'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s
                    ? 'w-6 bg-[var(--green)]'
                    : (['plan', 'details', 'pay'] as Step[]).indexOf(step) > i
                    ? 'bg-[var(--green)]'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>

          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center overflow-y-auto p-6">
        {/* Step 1: Choose Your Plan */}
        {step === 'plan' && (
          <div className="max-w-5xl w-full">
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
                onClick={() => setBoostType('none')}
                className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
                  boostType === 'none'
                    ? 'border-[var(--green)] shadow-xl scale-[1.02]'
                    : 'border-[var(--border)] hover:border-[var(--green)] hover:shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <h3 className="text-xl font-bold text-[var(--text)] mb-1">Standard</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">Basic listing</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[var(--text)]">$9.99</span>
                  </div>
                </div>

                {/* Features */}
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

                {/* Selection indicator */}
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
                onClick={() => setBoostType('7day')}
                className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
                  boostType === '7day'
                    ? 'border-[var(--green)] shadow-xl scale-[1.02]'
                    : 'border-[var(--border)] hover:border-[var(--green)] hover:shadow-lg'
                }`}
              >
                {/* Popular badge */}
                <div className="absolute -top-0 left-0 right-0">
                  <div className="bg-[var(--green)] text-white text-xs font-bold text-center py-1">
                    POPULAR
                  </div>
                </div>

                {/* Header */}
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

                {/* Features */}
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

                {/* Selection indicator */}
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
                onClick={() => setBoostType('30day')}
                className={`relative bg-white rounded-2xl text-left transition-all border-2 overflow-hidden ${
                  boostType === '30day'
                    ? 'border-[var(--gold)] shadow-xl scale-[1.02] ring-4 ring-[var(--gold)]/20'
                    : 'border-[var(--border)] hover:border-[var(--gold)] hover:shadow-lg'
                }`}
              >
                {/* Best Value badge */}
                <div className="absolute -top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black text-xs font-bold text-center py-1">
                    BEST VALUE — UNDER $1/DAY
                  </div>
                </div>

                {/* Header */}
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

                {/* Features */}
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
                  {/* Exclusive Pro features */}
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

                {/* Selection indicator */}
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
                onClick={handleNext}
                disabled={!canProceed()}
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
        )}

        {/* Step 2: Listing Details (Combined) */}
        {step === 'details' && boostType && (
          <div className="max-w-2xl w-full">
            <div className={`bg-white rounded-2xl p-6 border-2 ${
              boostType === '30day'
                ? 'border-[var(--gold)] shadow-lg shadow-amber-100'
                : boostType === '7day'
                ? 'border-[var(--green)] shadow-lg shadow-green-100'
                : 'border-[var(--border)]'
            }`}>
              {/* Tier badge - small, top right */}
              {boostType !== 'none' && (
                <div className="flex justify-end mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    boostType === '30day'
                      ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                      : 'bg-[var(--green)] text-white'
                  }`}>
                    <Star />
                    {TIER_INFO[boostType].name}
                  </div>
                </div>
              )}
              {/* Combination with inline preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Plate Combination
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={combination}
                    onChange={(e) => setCombination(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. LEGEND"
                    maxLength={10}
                    className="flex-1 px-4 py-3 text-xl font-mono tracking-wider uppercase border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                    autoFocus
                  />
                  {/* Compact inline preview */}
                  {combination && (
                    <div className="flex-shrink-0">
                      <PlateView
                        combination={combination}
                        state={state || 'VIC'}
                        colorScheme={colorScheme}
                        size="small"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* State & Type Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    State
                  </label>
                  <select
                    value={state || ''}
                    onChange={(e) => setState(e.target.value as AustralianState)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Plate Type
                  </label>
                  <select
                    value={plateType || ''}
                    onChange={(e) => setPlateType(e.target.value as PlateType)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                  >
                    <option value="">Select type</option>
                    {COMMON_PLATE_TYPES.map((type) => (
                      <option key={type} value={type}>{PLATE_TYPE_NAMES[type]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Color Scheme
                </label>
                <div className="flex gap-2">
                  {COLORS.map((scheme) => {
                    const colors = COLOR_SCHEME_COLORS[scheme];
                    return (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        className={`flex-1 p-2 rounded-xl border-2 transition-all ${
                          colorScheme === scheme
                            ? 'border-[var(--green)] scale-105'
                            : 'border-[var(--border)] hover:border-[var(--green)]'
                        }`}
                      >
                        <div
                          className="w-full aspect-[2/1] rounded flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: colors?.background, color: colors?.text }}
                        >
                          AB
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Photos <span className="text-[var(--text-muted)] font-normal">({photos.length}/{MAX_PHOTOS})</span>
                </label>

                {/* Photo grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image
                          src={photo.preview}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
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

                {/* Upload zone */}
                {photos.length < MAX_PHOTOS && (
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
                    />
                    <svg className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {isDragging ? 'Drop photos here' : 'Drag photos here or click to browse'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {MAX_PHOTOS - photos.length} photo{MAX_PHOTOS - photos.length !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)] my-6" />

              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Asking Price
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[var(--text-muted)]">$</span>
                    <input
                      type="number"
                      value={price || ''}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min={100}
                      className="w-full pl-10 pr-4 py-3 text-xl font-semibold border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="offers"
                      defaultChecked
                      className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">Open to offers</span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Minimum $100</p>
              </div>

              {/* Navigation - inside the card */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Review & Pay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 'pay' && boostType && (
          <div className="max-w-lg w-full">
            <div className={`bg-white rounded-2xl overflow-hidden border-2 ${
              boostType === '30day'
                ? 'border-[var(--gold)] shadow-lg shadow-amber-100'
                : boostType === '7day'
                ? 'border-[var(--green)] shadow-lg shadow-green-100'
                : 'border-[var(--border)]'
            }`}>
              {/* Plate Preview with tier badge */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center relative">
                {/* Tier badge overlay */}
                {boostType !== 'none' && (
                  <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    boostType === '30day'
                      ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                      : 'bg-[var(--green)] text-white'
                  }`}>
                    <Star />
                    {TIER_INFO[boostType].name}
                  </div>
                )}
                <PlateView
                  combination={combination}
                  state={state || 'VIC'}
                  colorScheme={colorScheme}
                  size="medium"
                />
                <p className="mt-3 text-white/60 text-sm">
                  {state} • {plateType && PLATE_TYPE_NAMES[plateType]}
                </p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Your Asking Price</span>
                  <span className="font-semibold text-[var(--text)]">${price.toLocaleString()}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[var(--text)] font-medium">Listing Fee</span>
                      {boostType !== 'none' && (
                        <p className="text-xs text-[var(--text-muted)]">
                          {boostType === '30day' ? '30 days featured' : '7 days featured'}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-[var(--text)]">${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Navigation - inside the card */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:bg-[#006B31] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay ${getTotal().toFixed(2)}
                  </button>
                </div>

                <p className="text-xs text-center text-[var(--text-muted)]">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
