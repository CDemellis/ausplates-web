import type { NextConfig } from "next";

/**
 * Content Security Policy configuration
 * H-WEB-001: Missing CSP headers fix
 *
 * Starting with report-only mode for initial monitoring.
 * Set CSP_ENFORCE=true in environment to enforce.
 */

// CSP directives
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",  // Required for Next.js inline scripts
    "'unsafe-eval'",    // Required for Next.js development
    "https://js.stripe.com",
    "https://m.stripe.network",
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",  // Required for Next.js and Tailwind inline styles
    "https://fonts.googleapis.com",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https://djestcmobrmoryhivduy.supabase.co",
    "https://*.stripe.com",
  ],
  'connect-src': [
    "'self'",
    "https://ausplates.onrender.com",
    "https://djestcmobrmoryhivduy.supabase.co",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.stripe.com",
    "https://m.stripe.network",
    "https://*.sentry.io",
  ],
  'frame-src': [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
  ],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

// Build CSP string
const cspString = Object.entries(cspDirectives)
  .map(([directive, values]) => {
    if (values.length === 0) {
      return directive;
    }
    return `${directive} ${values.join(' ')}`;
  })
  .join('; ');

// Security headers
const securityHeaders = [
  {
    // Content Security Policy - Report-Only mode initially
    // Change to 'Content-Security-Policy' when ready to enforce
    key: process.env.CSP_ENFORCE === 'true'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only',
    value: cspString,
  },
  {
    // Prevent clickjacking by disallowing iframe embedding
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Restrict browser features/APIs
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Enable XSS filter in older browsers (deprecated but harmless)
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'djestcmobrmoryhivduy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
