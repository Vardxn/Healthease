const DEFAULT_LOCAL_CLIENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAllowedOrigins() {
  return unique([
    ...DEFAULT_LOCAL_CLIENT_ORIGINS,
    'https://health-ease-rho.vercel.app',
    process.env.CLIENT_URL && process.env.CLIENT_URL.replace(/\/$/, ''),
    ...parseCsv(process.env.CLIENT_ORIGINS),
  ]);
}

const allowedOrigins = getAllowedOrigins();

// Previous dynamic CORS helper, removed from runtime use:
// function isAllowedOrigin(origin) {
//   if (!origin) {
//     return true;
//   }
//
//   const normalizedOrigin = origin.replace(/\/$/, '');
//
//   try {
//     const { hostname } = new URL(normalizedOrigin);
//     return allowedOrigins.includes(normalizedOrigin) || hostname.endsWith('.vercel.app');
//   } catch (err) {
//     return false;
//   }
// }

function validateRuntimeConfig() {
  const requiredInProduction = ['JWT_SECRET', 'MONGO_URI'];
  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === 'production' && missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. Authenticated routes and token creation may fail until it is configured.');
  }
}

module.exports = {
  allowedOrigins,
  validateRuntimeConfig,
};
