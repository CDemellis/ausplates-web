'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#1A1A1A',
                marginBottom: '0.5rem',
              }}
            >
              Oops!
            </h1>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: '#666666',
                marginBottom: '2rem',
              }}
            >
              We encountered a critical error. Please try refreshing the page.
            </p>

            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#00843D',
                color: 'white',
                fontWeight: '500',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>

            {error.digest && (
              <p
                style={{
                  marginTop: '2rem',
                  fontSize: '0.75rem',
                  color: '#999999',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
