import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: '#00843D',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'white', fontSize: '90px', fontWeight: 700 }}>A</span>
          <span style={{ color: '#FFCD00', fontSize: '24px', fontWeight: 600, marginTop: '-20px' }}>PLATES</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
