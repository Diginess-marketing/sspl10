import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies for API proxy
app.use(express.json());

// Security headers middleware - Comprehensive security implementation
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking protection - Deny all framing
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS Protection (legacy, but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy - Strict origin when cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - Disable unnecessary APIs
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  
  // Strict Transport Security - Force HTTPS (1 year with subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy - Enhanced
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://checkout.razorpay.com https://smtpjs.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https:; " +
    "frame-src https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests"
  );
  
  // Additional headers for enhanced security
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
});

// Enable compression middleware
import compression from 'compression';
app.use(compression({
  level: 6, // Good balance between compression and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
}));

// Serve static files with optimized cache headers
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: (req, res, path) => {
    // Cache static assets for 1 year, HTML for 1 hour
    if (path.endsWith('.html')) {
      return 60 * 60 * 1000; // 1 hour
    }
    // Cache JS/CSS/images for 1 year
    return 365 * 24 * 60 * 60 * 1000; // 1 year
  },
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add security headers to all static assets
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

    // Add cache control for different file types
    if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.html$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Add logging middleware for favicon requests
app.use((req, res, next) => {
  if (req.path.includes('favicon') || req.path === '/favicon.ico') {
    console.log(`🔍 Favicon request: ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')}`);
  }
  next();
});

// Health check - MUST come before SPA fallback
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontend server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Enhanced health check with detailed metrics
app.get('/health/detailed', async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    status: 'ok',
    message: 'Frontend server health check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    services: {}
  };

  // Check if static files directory exists and is accessible
  const fs = await import('fs');
  const staticDir = path.join(__dirname, 'dist');

  try {
    await fs.promises.access(staticDir, fs.constants.R_OK);
    const stats = await fs.promises.stat(staticDir);
    healthData.services.staticFiles = {
      status: 'ok',
      message: 'Static files directory is accessible',
      lastModified: stats.mtime.toISOString()
    };
  } catch (error) {
    healthData.services.staticFiles = {
      status: 'error',
      message: `Static files directory error: ${error.message}`,
      error: error.message
    };
    healthData.status = 'degraded';
  }

  // Check backend connectivity if backend URL is configured
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  if (backendUrl) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${backendUrl}/health`, {
        timeout: 5000 // 5 second timeout
      });

      if (response.ok) {
        const backendHealth = await response.json();
        healthData.services.backend = {
          status: 'ok',
          message: 'Backend is reachable',
          backendStatus: backendHealth.status,
          backendUptime: backendHealth.uptime
        };
      } else {
        throw new Error(`Backend returned status ${response.status}`);
      }
    } catch (error) {
      healthData.services.backend = {
        status: 'error',
        message: `Backend connectivity failed: ${error.message}`,
        error: error.message
      };
      healthData.status = 'degraded';
    }
  }

  // Check if index.html exists
  try {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    await fs.promises.access(indexPath, fs.constants.R_OK);
    healthData.services.indexFile = {
      status: 'ok',
      message: 'Index file is accessible'
    };
  } catch (error) {
    healthData.services.indexFile = {
      status: 'error',
      message: `Index file error: ${error.message}`,
      error: error.message
    };
    healthData.status = 'error';
  }

  // Calculate response time
  healthData.responseTime = Date.now() - startTime;

  // Set HTTP status based on overall health
  const httpStatus = healthData.status === 'ok' ? 200 : healthData.status === 'degraded' ? 206 : 503;
  res.status(httpStatus).json(healthData);
});

// CORS preflight for API routes with enhanced security (use RegExp for Express v5)
app.options(/^\/api(?:\/.*)?$/, (req, res) => {
 const origin = req.get('Origin') || 'http://localhost:5173';
 // Vary ensures caches differentiate by Origin/Access-Control-Request-* headers
 res.setHeader('Vary', 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method');
 res.setHeader('Access-Control-Allow-Origin', origin);
 res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
 // Echo requested headers if provided, else allow common headers
 const reqHeaders = req.get('Access-Control-Request-Headers') || 'Content-Type, Authorization, X-Requested-With';
 res.setHeader('Access-Control-Allow-Headers', reqHeaders);
 // Allow credentials if you plan to send cookies/authorization
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 // Cache preflight response for 1 day to reduce OPTIONS traffic
 res.setHeader('Access-Control-Max-Age', '86400');
 // Additional CORS security headers
 res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response-Size, X-Total-Count');
 return res.status(200).end();
});

// Proxy API routes to backend server (for dev/preview)
app.use('/api', async (req, res) => {
 try {
   const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
   // Preserve original path so backend receives /api/...
   const targetUrl = `${backendUrl}${req.originalUrl}`;

   // Build headers, avoid hop-by-hop headers
   const headers = {
     'x-forwarded-for': req.ip,
     'x-forwarded-proto': req.protocol,
     'x-forwarded-host': req.get('host') || '',
     'x-real-ip': req.ip
   };
   // Forward incoming headers except host/content-length (and content-type handled below)
   for (const [k, v] of Object.entries(req.headers)) {
     const key = k.toLowerCase();
     if (key === 'host' || key === 'content-length') continue;
     if (key === 'content-type') continue;
     headers[key] = v;
   }
   // Ensure content-type header is present for JSON bodies
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

   const globalFetch = (global.fetch ? global.fetch.bind(global) : (await import('node-fetch')).default);
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
     message: 'The payment service is currently unavailable. Please try again later.',
     timestamp: new Date().toISOString()
   });
 }
});

// Serve service worker
app.get('/custom-sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'custom-sw.js'));
});

// SPA fallback - MUST come LAST (Express v5: use RegExp instead of "*")
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`❤️  Health check available at: http://localhost:${port}/health`);
});
