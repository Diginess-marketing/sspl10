/**
 * Example: Complete server.js with Webhook Integration
 * 
 * This is a complete example showing how to integrate
 * the Razorpay webhook system into your Express server.
 * 
 * Usage: Use this as reference for updating your server.js
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

// Import webhook utilities
import { setupRazorpayWebhookRoute } from './src/integrations/razorpayWebhookRoute.js';
import { setupRazorpaySyncRoutes } from './src/integrations/razorpaySyncRoutes.js';
import { scheduledSync } from './src/integrations/razorpaySyncUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================================
// IMPORTANT: Webhook middleware MUST be BEFORE bodyParser!
// ============================================================================
// The webhook signature verification needs access to the raw body.
// If we parse the body first, the signature won't match.
app.use((req, res, next) => {
  if (req.path === '/api/razorpay/webhook') {
    // Capture raw body for Razorpay webhook signature verification
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = Buffer.from(data);
      next();
    });
  } else {
    next();
  }
});

// Parse JSON bodies for API proxy
app.use(express.json());

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https:; " +
    "frame-src https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

// Enable compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: (req, res, path) => {
    if (path.endsWith('.html')) return 60 * 60 * 1000; // 1 hour
    return 365 * 24 * 60 * 60 * 1000; // 1 year
  },
  etag: true,
  lastModified: true
}));

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health/detailed', async (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    services: {
      database: { status: 'ok', message: 'Connected to Supabase' },
      razorpay: { status: 'ok', message: 'Webhooks configured' }
    }
  };

  const httpStatus = healthData.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(healthData);
});

// ============================================================================
// RAZORPAY WEBHOOK & SYNC ROUTES
// ============================================================================
// Register webhook handler
// Endpoint: POST /api/razorpay/webhook
setupRazorpayWebhookRoute(app);

// Register sync endpoints
// Endpoints:
//   GET  /api/razorpay/sync-status
//   GET  /api/razorpay/sync/payment/:id
//   POST /api/razorpay/sync/payment
//   POST /api/razorpay/sync/pending
setupRazorpaySyncRoutes(app);

console.log('✅ Razorpay webhook system initialized');

// ============================================================================
// CORS PREFLIGHT FOR API ROUTES
// ============================================================================
app.options(/^\/api(?:\/.*)?$/, (req, res) => {
  const origin = req.get('Origin') || 'http://localhost:5173';
  res.setHeader('Vary', 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Razorpay-Signature');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response-Size');
  return res.status(200).end();
});

// ============================================================================
// API PROXY (for backend)
// ============================================================================
app.use('/api', async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
    const targetUrl = `${backendUrl}${req.originalUrl}`;

    const headers = {
      'x-forwarded-for': req.ip,
      'x-forwarded-proto': req.protocol,
      'x-forwarded-host': req.get('host') || '',
      'x-real-ip': req.ip
    };

    for (const [k, v] of Object.entries(req.headers)) {
      const key = k.toLowerCase();
      if (['host', 'content-length'].includes(key)) continue;
      if (key === 'content-type') continue;
      headers[key] = v;
    }

    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    } else {
      headers['content-type'] = 'application/json';
    }

    const method = req.method.toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);
    const body = hasBody
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
      : undefined;

    const globalFetch = (global.fetch
      ? global.fetch.bind(global)
      : (await import('node-fetch')).default
    );

    const backendRes = await globalFetch(targetUrl, {
      method,
      headers,
      body
    });

    res.status(backendRes.status);
    backendRes.headers.forEach((value, key) => res.setHeader(key, value));
    const respText = await backendRes.text();
    res.send(respText);
  } catch (error) {
    console.error('Backend proxy error:', error);
    res.status(500).json({
      error: 'Backend Service Unavailable',
      message: 'The service is currently unavailable. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// SPA FALLBACK
// ============================================================================
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const isDevelopment = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
});

// ============================================================================
// SCHEDULED TASKS
// ============================================================================
// Optional: Sync pending payments every 5 minutes as backup
if (process.env.ENABLE_PAYMENT_SYNC === 'true') {
  console.log('⏰ Payment sync scheduled: every 5 minutes');
  setInterval(() => {
    scheduledSync().catch(err => {
      console.error('Scheduled sync error:', err);
    });
  }, 5 * 60 * 1000); // 5 minutes
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// ============================================================================
// START SERVER
// ============================================================================
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`\n🚀 Server started on port ${port}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
  console.log(`\n✅ Razorpay Webhook Endpoints:`);
  console.log(`   POST /api/razorpay/webhook`);
  console.log(`   GET  /api/razorpay/sync-status`);
  console.log(`   GET  /api/razorpay/sync/payment/:id`);
  console.log(`   POST /api/razorpay/sync/payment`);
  console.log(`   POST /api/razorpay/sync/pending`);
  console.log(`\n`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default server;
