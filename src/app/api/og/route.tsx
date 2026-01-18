import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { captureEdgeException } from '@/lib/sentry-edge';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plate = searchParams.get('plate') || 'AUSPLATES';
    const state = searchParams.get('state') || 'VIC';

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
          {/* Plate display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#111827',
              borderRadius: '24px',
              padding: '48px 80px',
              marginBottom: '48px',
              border: '3px solid #374151',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                color: '#00843D',
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '0.3em',
                marginBottom: '12px',
              }}
            >
              {state}
            </div>
            <div
              style={{
                color: 'white',
                fontSize: '96px',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              {plate}
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: 'white', fontSize: '32px', fontWeight: 600 }}>Aus</span>
            <span style={{ color: '#00843D', fontSize: '32px', fontWeight: 600 }}>Plates</span>
          </div>

          <div
            style={{
              color: '#9CA3AF',
              fontSize: '24px',
              marginTop: '16px',
            }}
          >
            For Sale on ausplates.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    await captureEdgeException(error, {
      tags: { route: '/api/og', method: 'GET' },
      extra: { url: request.url },
    });

    // Return a fallback response
    return new Response('Error generating image', { status: 500 });
  }
}
