import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AusPlates - Australian Personalised Number Plates Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative plate */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '32px 64px',
            marginBottom: '48px',
            border: '2px solid #374151',
          }}
        >
          <div
            style={{
              color: '#00843D',
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              marginBottom: '8px',
            }}
          >
            AUSTRALIA
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '72px',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            AUSPLATES
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#9CA3AF',
            fontSize: '32px',
            textAlign: 'center',
          }}
        >
          Buy & Sell Personalised Number Plates
        </div>

        {/* States */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
          }}
        >
          {['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'].map((state) => (
            <div
              key={state}
              style={{
                backgroundColor: '#00843D',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {state}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
