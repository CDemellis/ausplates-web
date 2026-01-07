'use client';

import { PlateView } from '@/components/PlateView';
import { PlateColorScheme, AustralianState } from '@/types/listing';
import {
  PlateFormatIcon,
} from '@/components/icons';

const testCombinations = ['CUSTOM', 'LEGEND', 'BOSS', 'CEO', 'VIP', 'PLATES', '1'];

const colorSchemes: PlateColorScheme[] = [
  'white_on_black',
  'black_on_white',
  'yellow_on_black',
  'gold_on_black',
  'silver_on_black',
  'red_on_white',
  'blue_on_white',
  'afl_richmond',
  'afl_carlton',
];

const australianStates: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const plateFormats = ['standard', 'slimline', 'euro', 'square', 'motorcycle', 'jdm'];

export default function PlateDemoPage() {
  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Plate Components Demo</h1>

      {/* Plate Format Icons - Outline Style */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Plate Format Icons (Outline)</h2>
        <div className="bg-white p-6 rounded-xl space-y-8">
          {/* Default grey */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Default (24px, grey)</p>
            <div className="flex flex-wrap items-center gap-6">
              {plateFormats.map((format) => (
                <div key={format} className="flex flex-col items-center gap-2">
                  <PlateFormatIcon type={format} />
                  <span className="text-xs text-gray-400">{format}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Larger size */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Size: 32px</p>
            <div className="flex flex-wrap items-center gap-6">
              {plateFormats.map((format) => (
                <div key={format} className="flex flex-col items-center gap-2">
                  <PlateFormatIcon type={format} size={32} strokeWidth={2} />
                  <span className="text-xs text-gray-400">{format}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Green (Australian Green) */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Australian Green</p>
            <div className="flex flex-wrap items-center gap-6">
              {plateFormats.map((format) => (
                <PlateFormatIcon
                  key={format}
                  type={format}
                  size={28}
                  color="#00843D"
                  strokeWidth={2}
                />
              ))}
            </div>
          </div>

          {/* On dark background */}
          <div className="bg-neutral-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">On Dark Background (white)</p>
            <div className="flex flex-wrap items-center gap-6">
              {plateFormats.map((format) => (
                <PlateFormatIcon
                  key={format}
                  type={format}
                  size={28}
                  color="#FFFFFF"
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Australian States */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">All Australian States</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {australianStates.map((state) => (
            <div key={state} className="bg-white p-4 rounded-xl flex flex-col items-center">
              <PlateView
                combination="PLATES"
                state={state}
                size="medium"
              />
              <p className="text-sm text-gray-600 mt-2 font-medium">{state}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Size Variations */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Size Variations</h2>
        <div className="flex flex-wrap items-end gap-6 bg-white p-6 rounded-xl">
          <div className="text-center">
            <PlateView combination="CUSTOM" state="VIC" size="small" />
            <p className="text-sm text-gray-500 mt-2">Small (122x44)</p>
          </div>
          <div className="text-center">
            <PlateView combination="CUSTOM" state="VIC" size="medium" />
            <p className="text-sm text-gray-500 mt-2">Medium (194x70)</p>
          </div>
          <div className="text-center">
            <PlateView combination="CUSTOM" state="VIC" size="large" />
            <p className="text-sm text-gray-500 mt-2">Large (280x100)</p>
          </div>
          <div className="text-center">
            <PlateView combination="CUSTOM" state="VIC" size="xlarge" />
            <p className="text-sm text-gray-500 mt-2">XLarge (372x134)</p>
          </div>
        </div>
      </section>

      {/* Color schemes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Color Schemes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorSchemes.map((scheme) => (
            <div key={scheme} className="bg-white p-4 rounded-xl flex flex-col items-center">
              <PlateView
                combination="LEGEND"
                state="VIC"
                colorScheme={scheme}
                size="large"
              />
              <p className="text-sm text-gray-600 mt-2 font-mono">{scheme}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Different combinations */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Various Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testCombinations.map((combo) => (
            <div key={combo} className="bg-white p-4 rounded-xl flex flex-col items-center">
              <PlateView
                combination={combo}
                state="NSW"
                size="large"
              />
              <p className="text-sm text-gray-600 mt-2">{combo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reference comparison */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Full Width Preview</h2>
        <div className="bg-neutral-800 p-8 rounded-xl flex justify-center">
          <PlateView combination="CUSTOM" state="VIC" size="xlarge" />
        </div>
      </section>
    </div>
  );
}
