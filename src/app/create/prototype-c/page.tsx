'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PlateView } from '@/components/PlateView';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PLATE_TYPE_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

// Prototype C: Horizontal Step Flow
// - Full-width cards that slide horizontally
// - Each step is a focused single task
// - Floating plate preview in corner
// - Swipe/click to advance

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const COMMON_PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'prestige',
];

const COLORS: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black',
];

type BoostType = 'none' | '7day' | '30day';

const STEPS = [
  { id: 0, title: 'Combination', subtitle: 'What does your plate say?' },
  { id: 1, title: 'Location', subtitle: 'Which state is your plate from?' },
  { id: 2, title: 'Style', subtitle: 'Choose the color scheme' },
  { id: 3, title: 'Price', subtitle: 'Set your asking price' },
  { id: 4, title: 'Boost', subtitle: 'Choose your visibility' },
];

export default function PrototypeCPage() {
  const [step, setStep] = useState(0);
  const [combination, setCombination] = useState('');
  const [state, setState] = useState<AustralianState | null>(null);
  const [plateType, setPlateType] = useState<PlateType | null>(null);
  const [colorScheme, setColorScheme] = useState<PlateColorScheme>('white_on_black');
  const [price, setPrice] = useState<number>(0);
  const [boostType, setBoostType] = useState<BoostType>('none');

  const containerRef = useRef<HTMLDivElement>(null);

  const getTotal = () => {
    if (boostType === '30day') return 24.99;
    if (boostType === '7day') return 19.98;
    return 9.99;
  };

  const canProceed = () => {
    if (step === 0) return combination.length >= 2;
    if (step === 1) return state !== null && plateType !== null;
    if (step === 2) return true;
    if (step === 3) return price >= 100;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1 && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && canProceed()) handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, canProceed]);

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href="/create/prototypes"
            className="text-white/60 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          {/* Step Title */}
          <div className="text-center">
            <h1 className="text-white font-semibold">{STEPS[step].title}</h1>
            <p className="text-white/40 text-sm">{STEPS[step].subtitle}</p>
          </div>

          {/* Step Counter */}
          <span className="text-white/40 text-sm">{step + 1} / {STEPS.length}</span>
        </div>
      </header>

      {/* Floating Plate Preview */}
      {combination && (
        <div className="fixed top-20 right-6 z-10 bg-slate-800 rounded-xl p-4 shadow-2xl">
          <PlateView
            combination={combination}
            state={state || 'VIC'}
            colorScheme={colorScheme}
            size="small"
          />
          {price > 0 && (
            <p className="text-center mt-2 text-white font-bold">${price.toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Main Content - Horizontal Slider */}
      <main className="flex-1 flex items-center justify-center overflow-hidden" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${step * 100}vw)` }}
        >
          {/* Step 0: Combination */}
          <div className="w-screen flex-shrink-0 flex items-center justify-center px-6">
            <div className="max-w-lg w-full">
              <input
                type="text"
                value={combination}
                onChange={(e) => setCombination(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="LEGEND"
                maxLength={10}
                className="w-full px-6 py-8 text-5xl font-mono tracking-[0.3em] uppercase bg-transparent border-b-4 border-white/20 focus:border-[var(--green)] text-white text-center focus:outline-none placeholder:text-white/20"
                autoFocus
              />
              <p className="text-center mt-4 text-white/40">2-10 characters</p>
            </div>
          </div>

          {/* Step 1: State & Type */}
          <div className="w-screen flex-shrink-0 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full">
              <div className="mb-8">
                <p className="text-white/60 text-sm mb-4">State</p>
                <div className="grid grid-cols-4 gap-3">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className={`py-4 text-lg font-medium rounded-xl transition-all ${
                        state === s
                          ? 'bg-[var(--green)] text-white scale-105 shadow-lg shadow-green-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-4">Type</p>
                <div className="grid grid-cols-3 gap-3">
                  {COMMON_PLATE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setPlateType(type)}
                      className={`py-4 text-sm font-medium rounded-xl transition-all ${
                        plateType === type
                          ? 'bg-[var(--green)] text-white scale-105 shadow-lg shadow-green-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {PLATE_TYPE_NAMES[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Color Scheme */}
          <div className="w-screen flex-shrink-0 flex items-center justify-center px-6">
            <div className="max-w-3xl w-full">
              <div className="grid grid-cols-3 gap-4">
                {COLORS.map((scheme) => {
                  const colors = COLOR_SCHEME_COLORS[scheme];
                  return (
                    <button
                      key={scheme}
                      onClick={() => setColorScheme(scheme)}
                      className={`relative p-6 rounded-2xl transition-all ${
                        colorScheme === scheme
                          ? 'bg-white/20 scale-105 ring-4 ring-[var(--green)]'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-full aspect-[2.5/1] rounded-lg flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: colors?.background, color: colors?.text }}
                      >
                        {combination || 'PLATE'}
                      </div>
                      {colorScheme === scheme && (
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--green)] rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Price */}
          <div className="w-screen flex-shrink-0 flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
              <div className="relative inline-block">
                <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-6xl text-white/30">$</span>
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min={100}
                  className="w-64 py-4 text-7xl font-bold text-center bg-transparent text-white focus:outline-none border-b-4 border-white/20 focus:border-[var(--green)]"
                />
              </div>
              <p className="mt-4 text-white/40">Minimum $100</p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <input
                  type="checkbox"
                  id="offers"
                  defaultChecked
                  className="w-6 h-6 rounded border-white/20 bg-white/10 text-[var(--green)] focus:ring-[var(--green)]"
                />
                <label htmlFor="offers" className="text-white">
                  Open to offers
                </label>
              </div>
            </div>
          </div>

          {/* Step 4: Boost */}
          <div className="w-screen flex-shrink-0 flex items-center justify-center px-6">
            <div className="max-w-4xl w-full">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Standard */}
                <button
                  onClick={() => setBoostType('none')}
                  className={`relative bg-white/5 rounded-2xl p-6 text-left transition-all ${
                    boostType === 'none'
                      ? 'ring-4 ring-[var(--green)] bg-white/10 scale-105'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Standard</h3>
                  <p className="text-4xl font-bold text-white mb-4">$9.99</p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li>• Listed until sold</li>
                    <li>• Secure messaging</li>
                    <li>• Up to 5 photos</li>
                  </ul>
                </button>

                {/* 7-Day Boost */}
                <button
                  onClick={() => setBoostType('7day')}
                  className={`relative bg-white/5 rounded-2xl p-6 text-left transition-all ${
                    boostType === '7day'
                      ? 'ring-4 ring-[var(--gold)] bg-white/10 scale-105'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--green)] text-white text-xs font-semibold rounded-full">
                    POPULAR
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-1">7-Day Boost</h3>
                  <p className="text-4xl font-bold text-white mb-4">$19.98</p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li>• Everything in Standard</li>
                    <li className="text-[var(--gold)]">• Featured for 7 days</li>
                    <li>• 3x more visibility</li>
                  </ul>
                </button>

                {/* 30-Day Boost */}
                <button
                  onClick={() => setBoostType('30day')}
                  className={`relative bg-white/5 rounded-2xl p-6 text-left transition-all ${
                    boostType === '30day'
                      ? 'ring-4 ring-[var(--gold)] bg-white/10 scale-105'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--gold)] text-black text-xs font-semibold rounded-full">
                    BEST VALUE
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-1">30-Day Boost</h3>
                  <p className="text-4xl font-bold text-white mb-4">$24.99</p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li>• Everything in Standard</li>
                    <li className="text-[var(--gold)]">• Featured for 30 days</li>
                    <li>• Priority in search</li>
                  </ul>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="flex-shrink-0 px-6 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--green)] transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <footer className="flex-shrink-0 bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    // Only allow going back or to completed steps
                    if (i <= step || (i === step + 1 && canProceed())) {
                      setStep(i);
                    }
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === i
                      ? 'w-8 bg-[var(--green)]'
                      : i < step
                      ? 'bg-white/60'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  canProceed()
                    ? 'bg-[var(--green)] text-white hover:bg-[#006B31]'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Next
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-8 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:bg-[#006B31] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay ${getTotal().toFixed(2)}
              </button>
            )}
          </div>

          <p className="text-center mt-2 text-white/30 text-xs">
            Use arrow keys to navigate
          </p>
        </div>
      </footer>
    </div>
  );
}
