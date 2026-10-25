import { defineConfig } from 'vite';
import 'dotenv/config';

// Vite dev server API middleware to handle serverless endpoints locally
function neonApiPlugin() {
  return {
    name: 'neon-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        // Parse query params into req.query
        req.query = Object.fromEntries(url.searchParams.entries());

        // Helper to parse JSON body if POST/PUT
        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch (e) {
            req.body = body;
          }
        }

        // Helper for res.status().json()
        const origEnd = res.end.bind(res);
        res.status = function(code) {
          res.statusCode = code;
          return res;
        };
        res.json = function(data) {
          res.setHeader('Content-Type', 'application/json');
          return origEnd(JSON.stringify(data));
        };

        try {
          if (pathname === '/api/health') {
            const { default: handler } = await import('./api/health.js');
            return handler(req, res);
          } else if (pathname === '/api/patients') {
            const { default: handler } = await import('./api/patients.js');
            return handler(req, res);
          } else if (pathname === '/api/billing') {
            const { default: handler } = await import('./api/billing.js');
            return handler(req, res);
          } else if (pathname === '/api/pharmacy') {
            const { default: handler } = await import('./api/pharmacy.js');
            return handler(req, res);
          } else if (pathname === '/api/expenses') {
            const { default: handler } = await import('./api/expenses.js');
            return handler(req, res);
          } else if (pathname === '/api/config') {
            const { default: handler } = await import('./api/config.js');
            return handler(req, res);
          } else if (pathname === '/api/sync') {
            const { default: handler } = await import('./api/sync.js');
            return handler(req, res);
          }
        } catch (err) {
          console.error('Local API Handler Error:', err);
          res.statusCode = 500;
          return res.json({ error: err.message });
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [neonApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
