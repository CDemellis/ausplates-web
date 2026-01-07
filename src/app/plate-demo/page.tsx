'use client';

import { PlateTemplateVIC } from '@/components/PlateTemplateVIC';
import { PlateColorScheme } from '@/types/listing';
import {
  PlateFormatIcon,
  PlateIconStandard,
  PlateIconSlimline,
  PlateIconEuro,
  PlateIconSquare,
  PlateIconMotorcycle,
  PlateIconJDM,
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

const plateFormats = ['standard', 'slimline', 'euro', 'square', 'motorcycle', 'jdm'];

export default function PlateDemoPage() {
  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Plate Components Demo</h1>

      {/* Plate Format Icons */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Plate Format Icons</h2>
        <div className="bg-white p-6 rounded-xl space-y-8">
          {/* Size 24 */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Size: 24px height</p>
            <div className="flex flex-wrap items-center gap-4">
              {plateFormats.map((format) => (
                <div key={format} className="flex flex-col items-center gap-1">
                  <PlateFormatIcon type={format} size={24} />
                  <span className="text-xs text-gray-400">{format}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size 32 */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Size: 32px height (default)</p>
            <div className="flex flex-wrap items-center gap-4">
              {plateFormats.map((format) => (
                <div key={format} className="flex flex-col items-center gap-1">
                  <PlateFormatIcon type={format} size={32} />
                  <span className="text-xs text-gray-400">{format}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size 48 */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Size: 48px height</p>
            <div className="flex flex-wrap items-center gap-4">
              {plateFormats.map((format) => (
                <div key={format} className="flex flex-col items-center gap-2">
                  <PlateFormatIcon type={format} size={48} />
                  <span className="text-xs text-gray-400">{format}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Custom Colors (Yellow on Black)</p>
            <div className="flex flex-wrap items-center gap-4">
              {plateFormats.map((format) => (
                <PlateFormatIcon
                  key={format}
                  type={format}
                  size={32}
                  fill="#FFCD00"
                  stroke="#1A1A1A"
                  labelColor="#1A1A1A"
                />
              ))}
            </div>
          </div>

          {/* Light background */}
          <div className="bg-neutral-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">On Dark Background (White scheme)</p>
            <div className="flex flex-wrap items-center gap-4">
              {plateFormats.map((format) => (
                <PlateFormatIcon
                  key={format}
                  type={format}
                  size={32}
                  fill="#FFFFFF"
                  stroke="#1A1A1A"
                  labelColor="#1A1A1A"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VIC Plate Template - Size variations */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Size Variations</h2>
        <div className="flex flex-wrap items-end gap-6 bg-white p-6 rounded-xl">
          <div className="text-center">
            <PlateTemplateVIC combination="CUSTOM" size="small" />
            <p className="text-sm text-gray-500 mt-2">Small</p>
          </div>
          <div className="text-center">
            <PlateTemplateVIC combination="CUSTOM" size="medium" />
            <p className="text-sm text-gray-500 mt-2">Medium</p>
          </div>
          <div className="text-center">
            <PlateTemplateVIC combination="CUSTOM" size="large" />
            <p className="text-sm text-gray-500 mt-2">Large</p>
          </div>
          <div className="text-center">
            <PlateTemplateVIC combination="CUSTOM" size="xlarge" />
            <p className="text-sm text-gray-500 mt-2">XLarge</p>
          </div>
        </div>
      </section>

      {/* Color schemes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Color Schemes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorSchemes.map((scheme) => (
            <div key={scheme} className="bg-white p-4 rounded-xl">
              <PlateTemplateVIC
                combination="LEGEND"
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
            <div key={combo} className="bg-white p-4 rounded-xl">
              <PlateTemplateVIC
                combination={combo}
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
          <PlateTemplateVIC combination="CUSTOM" size="xlarge" />
        </div>
      </section>
    </div>
  );
}
