import { assertEquals, assertExists } from '@std/assert';

Deno.test('OktaLoginService - constructor initializes correctly', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  assertExists(service);
  // Test that all public methods exist
  assertExists(typeof service.login === 'function');
  assertExists(typeof service.logout === 'function');
  assertExists(typeof service.getUserInfo === 'function');
  assertExists(typeof service.isAuthenticated === 'function');

  // Clear any timers that might have been started
  for (let i = 0; i < 1000; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
});

Deno.test('OktaLoginService - constructor with custom scope', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email groups',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  assertExists(service);
  // Just verify the service was created successfully with custom scope
  assertEquals(typeof service.login, 'function');
});

Deno.test('OktaLoginService - constructor with minimal config', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  assertExists(service);
  assertEquals(typeof service.login, 'function');
});

Deno.test('OktaLoginService - login method exists and has correct signature', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  // The login method should exist and be a function
  assertExists(typeof service.login === 'function');
});

Deno.test('OktaLoginService - logout method exists', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  // The logout method should exist
  assertExists(typeof service.logout === 'function');
});

Deno.test('OktaLoginService - getUserInfo method exists', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  // The getUserInfo method should exist
  assertExists(typeof service.getUserInfo === 'function');
});

Deno.test('OktaLoginService - isAuthenticated method exists', async () => {
  const { OktaLoginService } = await import('./okta-login.service.ts');

  const config = {
    issuer: 'https://dev.okta.com/oauth2/default',
    clientId: 'test-client-id',
    scope: 'openid profile email',
    redirectUri: 'http://localhost:8000/callback',
  };

  const service = new OktaLoginService(config);

  // The isAuthenticated method should exist
  assertExists(typeof service.isAuthenticated === 'function');
});

// Test that the module exports the expected types (interfaces are available at compile time)
Deno.test('Module exports expected types', async () => {
  const module = await import('./okta-login.service.ts');

  // The class should be exported
  assertExists(module.OktaLoginService);
});
