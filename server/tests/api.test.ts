import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import app from '../src/index.js';

describe('BlockerGraph AI Production API & CORS Verification Suite', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('GET /api/health should respond with 200, healthy status and JSON content-type', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('BlockerGraph AI Core Engine');
    expect(data.timestamp).toBeDefined();
  });

  it('GET /api/auth/me should return JSON with success: true', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBeDefined();
  });

  it('POST /api/auth/login should issue an auth token and user record', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.manager@example.com' })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test.manager@example.com');
  });

  it('CORS: should allow cross-origin requests from Vercel deployments with credentials', async () => {
    const vercelOrigin = 'https://blockergraph-ai.vercel.app';
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: vercelOrigin
      }
    });

    expect(res.status).toBe(200);
    // Dynamic origin reflection allows credentials: 'include' without wildcard restrictions
    expect(res.headers.get('access-control-allow-origin')).toBe(vercelOrigin);
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('CORS: OPTIONS preflight request should return 204 with allowed headers & methods', async () => {
    const vercelOrigin = 'https://blockergraph-ai-preview-abc123.vercel.app';
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'OPTIONS',
      headers: {
        Origin: vercelOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(vercelOrigin);
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('404 Handler: unknown endpoints should return structured JSON instead of HTML', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Endpoint not found');
  });
});
