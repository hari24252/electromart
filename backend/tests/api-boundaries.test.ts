import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { signToken } from '../src/utils/tokens.js';

describe('HTTP API boundaries', () => {
  it('serves equivalent health checks through the compatible and versioned API prefixes', async () => {
    const [compatible, versioned] = await Promise.all([
      request(app).get('/api/health'),
      request(app).get('/api/v1/health'),
    ]);

    for (const response of [compatible, versioned]) {
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ success: true, data: { status: 'healthy' } });
    }
  });

  it('reports not-ready when the database is intentionally not connected in an HTTP-only test', async () => {
    const response = await request(app).get('/api/ready');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ success: true, data: { status: 'not_ready', database: 'disconnected' } });
  });

  it('returns the standard error envelope and correlation id for unknown routes', async () => {
    const response = await request(app).get('/api/not-a-route');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, code: 'ROUTE_NOT_FOUND' });
    expect(response.body.requestId).toBeDefined();
  });

  it('rejects invalid public catalogue queries before reaching persistence', async () => {
    const response = await request(app).get('/api/products?minPrice=100&maxPrice=10');

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ success: false, code: 'QUERY_VALIDATION_ERROR' });
  });

  it('keeps customer and administrator token scopes separate', async () => {
    const customerToken = signToken('64d000000000000000000001', 'user', 'access', 0, { sessionId: 'test-session' });
    const response = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, code: 'UNAUTHORIZED' });
  });

  it('prevents a sub-administrator from creating another administrator before database access', async () => {
    const token = signToken('64d000000000000000000002', 'admin', 'access', 0, { sessionId: 'test-session', adminRole: 'sub-admin' });
    const response = await request(app)
      .post('/api/admin/auth/create-sub-admin')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another Admin', email: 'another@example.com', password: 'StrongPassword123!' });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ success: false, code: 'FORBIDDEN' });
  });
});
