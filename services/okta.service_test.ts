import { assertEquals, assertExists, assertThrows } from '@std/assert';

// Test OktaService core functionality
Deno.test('OktaService - constructor sets config correctly', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://test.okta.com',
    clientId: 'test-client',
    apiToken: 'test-token',
    redirectUri: 'http://localhost:8000/callback',
    scope: 'openid profile email',
  };

  const service = new OktaService(config);

  // Test that service was created (we can't access private properties directly)
  assertExists(service);
});

Deno.test('OktaService - getAuthorizeUrl generates correct URL', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://dev.okta.com',
    clientId: 'test-client-id',
    apiToken: 'test-api-token',
    redirectUri: 'http://localhost:8000/callback',
    scope: 'openid profile email',
  };

  const service = new OktaService(config);
  const url = service.getAuthorizeUrl({ state: 'test-state', nonce: 'test-nonce' });

  assertExists(url);
  assertEquals(url.includes('https://dev.okta.com/oauth2/default/v1/authorize'), true);
  assertEquals(url.includes('client_id=test-client-id'), true);
  assertEquals(url.includes('state=test-state'), true);
  assertEquals(url.includes('nonce=test-nonce'), true);
});

Deno.test('OktaService - decodeIdToken decodes valid JWT', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://dev.okta.com',
    clientId: 'test-client-id',
    apiToken: 'test-api-token',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaService(config);

  // Create a simple JWT payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: 'user123', name: 'Test User', email: 'test@example.com' }),
  );
  const signature = 'signature';
  const token = `${header}.${payload}.${signature}`;

  const decoded = service.decodeIdToken(token);

  assertEquals(decoded.sub, 'user123');
  assertEquals(decoded.name, 'Test User');
  assertEquals(decoded.email, 'test@example.com');
});

Deno.test('OktaService - decodeIdToken throws on invalid JWT', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://dev.okta.com',
    clientId: 'test-client-id',
    apiToken: 'test-api-token',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaService(config);

  assertThrows(
    () => {
      service.decodeIdToken('invalid.jwt.token');
    },
    Error,
    'Failed to decode ID token',
  );
});

Deno.test('OktaService - handles custom scope', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://dev.okta.com',
    clientId: 'test-client-id',
    apiToken: 'test-api-token',
    redirectUri: 'http://localhost:8000/callback',
    scope: 'openid profile email groups',
  };

  const service = new OktaService(config);
  const url = service.getAuthorizeUrl();

  assertExists(url);
  assertEquals(url.includes('scope=openid+profile+email+groups'), true);
});

Deno.test('OktaService - uses default scope when none provided', async () => {
  const { OktaService } = await import('./okta.service.ts');

  const config = {
    domain: 'https://dev.okta.com',
    clientId: 'test-client-id',
    apiToken: 'test-api-token',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaService(config);
  const url = service.getAuthorizeUrl();

  assertExists(url);
  assertEquals(url.includes('scope=openid+profile+email'), true);
});
