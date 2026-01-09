'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlateView } from '@/components/PlateView';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PLATE_TYPE_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// Prototype A: Configurator Style (Apple/Tesla vibe)
// - Single viewport, no scrolling
// - Split layout: preview left, config right
// - Sticky pricing bar at bottom
// - Step through config horizontally

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const COMMON_PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'prestige',
];

const COMMON_COLORS: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black',
];

type ConfigStep = 'plate' | 'style' | 'price';
type BoostType = 'none' | '7day' | '30day';

export default function PrototypeAPage() {
  const [step, setStep] = useState<ConfigStep>('plate');
  const [combination, setCombination] = useState('');
  const [state, setState] = useState<AustralianState | null>(null);
  const [plateType, setPlateType] = useState<PlateType | null>(null);
  const [colorScheme, setColorScheme] = useState<PlateColorScheme>('white_on_black');
  const [price, setPrice] = useState<number>(0);
  const [boostType, setBoostType] = useState<BoostType>('none');

  const getTotal = () => {
    if (boostType === '30day') return 24.99;
    if (boostType === '7day') return 19.98;
    return 9.99;
  };

  const canProceed = () => {
    if (step === 'plate') {
      return combination.length >= 2 && state && plateType;
    }
    if (step === 'style') {
      return true;
    }
    if (step === 'price') {
      return price >= 100;
    }
    return false;
  };

  const handleNext = () => {
    if (step === 'plate' && canProceed()) setStep('style');
    else if (step === 'style') setStep('price');
  };

  const handleBack = () => {
    if (step === 'style') setStep('plate');
    else if (step === 'price') setStep('style');
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href="/create/prototypes"
            className="text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-[var(--text)]">List Your Plate</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Live Plate Preview */}
        <div className="w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
          <div className="text-center">
            {combination ? (
              <>
                <PlateView
                  combination={combination}
                  state={state || 'VIC'}
                  colorScheme={colorScheme}
                  size="large"
                />
                <p className="mt-6 text-white/60 text-sm">
                  {state && plateType ? `${state} • ${PLATE_TYPE_NAMES[plateType]}` : 'Configure your plate →'}
                </p>
              </>
            ) : (
              <div className="text-white/40">
                <div className="w-64 h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">YOUR PLATE</span>
                </div>
                <p className="text-sm">Enter your combination to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Configuration */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Step Indicator */}
          <div className="flex-shrink-0 px-8 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              {(['plate', 'style', 'price'] as ConfigStep[]).map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    if (s === 'plate') setStep(s);
                    else if (s === 'style' && combination && state && plateType) setStep(s);
                    else if (s === 'price' && combination && state && plateType) setStep(s);
                  }}
                  className={`flex items-center gap-2 ${
                    step === s ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full text-sm flex items-center justify-center ${
                    step === s
                      ? 'bg-[var(--green)] text-white'
                      : 'bg-[var(--background-subtle)]'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-medium capitalize hidden sm:inline">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {step === 'plate' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Combination
                  </label>
                  <input
                    type="text"
                    value={combination}
                    onChange={(e) => setCombination(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. LEGEND"
                    maxLength={10}
                    className="w-full px-4 py-4 text-2xl font-mono tracking-wider uppercase border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent text-center"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    State
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {STATES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setState(s)}
                        className={`py-3 text-sm font-medium rounded-xl border transition-all ${
                          state === s
                            ? 'bg-[var(--green)] text-white border-[var(--green)] scale-105'
                            : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_PLATE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setPlateType(type)}
                        className={`py-3 text-sm font-medium rounded-xl border transition-all ${
                          plateType === type
                            ? 'bg-[var(--green)] text-white border-[var(--green)] scale-105'
                            : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                        }`}
                      >
                        {PLATE_TYPE_NAMES[type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'style' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {COMMON_COLORS.map((scheme) => {
                      const colors = COLOR_SCHEME_COLORS[scheme];
                      return (
                        <button
                          key={scheme}
                          onClick={() => setColorScheme(scheme)}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            colorScheme === scheme
                              ? 'border-[var(--green)] scale-105 shadow-lg'
                              : 'border-[var(--border)] hover:border-[var(--green)]'
                          }`}
                        >
                          <div
                            className="w-full aspect-[2.5/1] rounded-lg flex items-center justify-center text-lg font-bold"
                            style={{ backgroundColor: colors?.background, color: colors?.text }}
                          >
                            AB
                          </div>
                          {colorScheme === scheme && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--green)] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)]">
                    More options like size format and material will be available after purchase.
                  </p>
                </div>
              </div>
            )}

            {step === 'price' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Your Asking Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--text-muted)]">$</span>
                    <input
                      type="number"
                      value={price || ''}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min={100}
                      className="w-full pl-10 pr-4 py-4 text-3xl font-bold border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Minimum $100</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--background-subtle)] rounded-xl">
                  <input
                    type="checkbox"
                    id="offers"
                    defaultChecked
                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <label htmlFor="offers" className="text-sm text-[var(--text)]">
                    Open to offers
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    placeholder="Tell buyers about your plate..."
                    rows={3}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-shrink-0 px-8 py-4 border-t border-[var(--border)]">
            <div className="flex gap-3">
              {step !== 'plate' && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {step === 'price' ? 'Continue to Payment' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom: Sticky Pricing Bar */}
      <footer className="flex-shrink-0 bg-white border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Boost Options */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--text)]">Choose your listing:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBoostType('none')}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                    boostType === 'none'
                      ? 'border-[var(--green)] bg-[var(--green)]/10 text-[var(--green)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--green)]'
                  }`}
                >
                  Standard $9.99
                </button>
                <button
                  onClick={() => setBoostType('7day')}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                    boostType === '7day'
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    7 Days $19.98
                  </span>
                </button>
                <button
                  onClick={() => setBoostType('30day')}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all relative ${
                    boostType === '30day'
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]'
                  }`}
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[var(--gold)] text-[10px] font-bold text-black rounded">BEST</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    30 Days $24.99
                  </span>
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-[var(--text-muted)]">Total</p>
                <p className="text-2xl font-bold text-[var(--text)]">${getTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
