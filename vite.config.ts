import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

const SIGNED_URL_SECRET = 'cinebox4u_master_sign_secret_2026_enterprise';

function isPrivateOrLoopbackIP(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname === '169.254.169.254' ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return true;
  }
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
  }
  return false;
}

let cachedDevSitemap: { xml: string; expiresAt: number } | null = null;

// Dev API plugin to handle Enterprise backend routes directly inside Vite
function devApiPlugin(): Plugin {
  return {
    name: 'cinebox-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          try {
            if (!cachedDevSitemap || Date.now() > cachedDevSitemap.expiresAt) {
              const { generateSitemapXml } = await import('./scripts/generate-sitemap.mjs');
              const { xml } = await generateSitemapXml();
              cachedDevSitemap = { xml, expiresAt: Date.now() + 60_000 };
            }
            res.end(cachedDevSitemap.xml);
          } catch {
            res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://cinebox4u.netlify.app/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`);
          }
          return;
        }

        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(
            `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /profile\nDisallow: /profile/\nDisallow: /search\nDisallow: /watch\nDisallow: /api/\n\nSitemap: https://cinebox4u.netlify.app/sitemap.xml\n`
          );
          return;
        }

        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Health check
        if (req.url === '/api/health') {
          res.end(JSON.stringify({
            status: 'ok',
            service: 'CineBox4u Enterprise Streaming Engine (Dev Mode)',
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Anti-SSRF Stream Verifier
        if (req.url.startsWith('/api/admin/verify-stream')) {
          const parsedUrl = new URL(req.url, 'http://localhost:3000');
          const targetUrl = parsedUrl.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ valid: false, message: 'URL required' }));
            return;
          }

          try {
            const urlObj = new URL(targetUrl);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ valid: false, message: 'Disallowed protocol' }));
              return;
            }

            if (isPrivateOrLoopbackIP(urlObj.hostname)) {
              res.statusCode = 403;
              res.end(JSON.stringify({
                valid: false,
                message: 'Security Violation: Access to private networks/loopback blocked (SSRF Guard)',
              }));
              return;
            }

            const client = urlObj.protocol === 'https:' ? https : http;
            const start = Date.now();

            const clientReq = client.request(
              targetUrl,
              {
                method: 'HEAD',
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 CineBox4u/2.0' },
              },
              (clientRes) => {
                const latencyMs = Date.now() - start;
                const statusCode = clientRes.statusCode || 0;
                const isValid = statusCode >= 200 && statusCode < 400;

                res.end(JSON.stringify({
                  valid: isValid,
                  statusCode,
                  latencyMs,
                  message: isValid ? `Stream active (HTTP ${statusCode}, ${latencyMs}ms)` : `HTTP ${statusCode}`,
                }));
              }
            );

            clientReq.on('error', (err) => {
              res.end(JSON.stringify({ valid: false, latencyMs: Date.now() - start, message: err.message }));
            });

            clientReq.on('timeout', () => {
              clientReq.destroy();
              res.end(JSON.stringify({ valid: false, latencyMs: 5000, message: 'Connection timed out' }));
            });

            clientReq.end();
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ valid: false, message: e.message }));
          }
          return;
        }

        // Helper to parse POST JSON body
        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(JSON.parse(body || '{}'));
              } catch {
                resolve({});
              }
            });
          });
        };

        // Signed URL Generator
        if (req.url === '/api/security/signed-playback-url' && req.method === 'POST') {
          const body = await parseBody();
          const { mediaId, streamUrl, userId, clientCountry = 'BD', authorizedRegions = ['ALL'] } = body;

          if (
            authorizedRegions &&
            !authorizedRegions.includes('ALL') &&
            !authorizedRegions.includes(clientCountry.toUpperCase())
          ) {
            res.statusCode = 403;
            res.end(JSON.stringify({
              error: 'GEOGRAPHIC_RESTRICTION',
              message: `Content not licensed in region ${clientCountry}`,
            }));
            return;
          }

          const expiresAt = Math.floor(Date.now() / 1000) + 4 * 3600;
          const payload = `${mediaId}|${userId || 'anonymous'}|${expiresAt}`;
          const hmac = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(payload).digest('hex');
          const token = Buffer.from(JSON.stringify({ payload, signature: hmac, exp: expiresAt })).toString('base64');
          const signedUrl = `${streamUrl}${streamUrl?.includes('?') ? '&' : '?'}cb_token=${token}`;

          res.end(JSON.stringify({ signedUrl, token, expiresAt, regionVerified: clientCountry }));
          return;
        }

        // DRM License Endpoint
        if (req.url === '/api/drm/license' && req.method === 'POST') {
          const body = await parseBody();
          const rawKeyId = body.keyId || '0123456789abcdef';
          const rawKey = crypto.createHash('sha256').update(rawKeyId + SIGNED_URL_SECRET).digest('hex').substring(0, 32);

          res.end(JSON.stringify({
            keys: [{ kty: 'oct', k: Buffer.from(rawKey, 'hex').toString('base64url'), kid: Buffer.from(rawKeyId).toString('base64url') }],
            type: 'temporary',
          }));
          return;
        }

        // Payment Webhook
        if (req.url === '/api/payments/webhook' && req.method === 'POST') {
          const body = await parseBody();
          res.end(JSON.stringify({
            verified: true,
            transactionId: body.transactionId || `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Watch Party Sync
        if (req.url === '/api/watchparty/sync' && req.method === 'POST') {
          const body = await parseBody();
          const isHost = body.requesterUid === body.hostUid;
          if (!isHost && ['play', 'pause', 'seek'].includes(body.action)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'PERMISSION_DENIED', message: 'Only host can control room state' }));
            return;
          }
          res.end(JSON.stringify({ synced: true, roomCode: body.roomCode, currentTime: body.currentTime || 0 }));
          return;
        }

        // Community Rate-Limiter & Spam Filter
        if (req.url === '/api/community/comments' && req.method === 'POST') {
          const body = await parseBody();
          const isSpam = /http:\/\/bit\.ly|free money|buy crypto/i.test(body.comment || '');
          res.end(JSON.stringify({ accepted: !isSpam, isModerated: isSpam, id: `comm-${Date.now()}` }));
          return;
        }

        // Transcode Queue Endpoint
        if (req.url === '/api/admin/transcode-queue') {
          if (req.method === 'POST') {
            const body = await parseBody();
            res.end(JSON.stringify({
              success: true,
              job: {
                id: `job-${Date.now().toString().slice(-4)}`,
                mediaId: body.mediaId || 'custom',
                mediaTitle: body.mediaTitle || 'Custom Ingest',
                status: 'transcoding',
                progress: 10,
                speed: '2.5x',
                fps: 60,
                etaSeconds: 80,
                renditions: body.renditions || ['1080p', '720p', '480p'],
                createdAt: new Date().toISOString(),
              },
            }));
            return;
          }
          res.end(JSON.stringify({
            jobs: [
              {
                id: 'job-1094',
                mediaId: 'movie-1',
                mediaTitle: 'Oppenheimer',
                status: 'transcoding',
                progress: 74,
                speed: '2.8x',
                fps: 68,
                etaSeconds: 42,
                renditions: ['4K', '1080p', '720p', '480p'],
                createdAt: new Date().toISOString(),
              },
            ],
          }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), devApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
