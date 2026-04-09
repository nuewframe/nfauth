import { assertEquals, assertStringIncludes, assertThrows } from '@std/assert';
import { extractCodeFromRedirectNavigation } from './cdp.ts';

Deno.test('extractCodeFromRedirectNavigation returns code on matching redirect URI', () => {
  const code = extractCodeFromRedirectNavigation(
    'http://localhost:7879/callback?code=abc123&state=expected-state',
    'http://localhost:7879/callback',
    'expected-state',
  );

  assertEquals(code, 'abc123');
});

Deno.test('extractCodeFromRedirectNavigation handles trailing slash differences', () => {
  const code = extractCodeFromRedirectNavigation(
    'http://localhost:7879/callback/?code=abc123&state=expected-state',
    'http://localhost:7879/callback',
    'expected-state',
  );

  assertEquals(code, 'abc123');
});

Deno.test('extractCodeFromRedirectNavigation returns null for non-matching path', () => {
  const code = extractCodeFromRedirectNavigation(
    'http://localhost:7879/other?code=abc123&state=expected-state',
    'http://localhost:7879/callback',
    'expected-state',
  );

  assertEquals(code, null);
});

Deno.test('extractCodeFromRedirectNavigation throws when OAuth error is returned', () => {
  const error = assertThrows(
    () =>
      extractCodeFromRedirectNavigation(
        'http://localhost:7879/callback?error=access_denied&error_description=User%20cancelled',
        'http://localhost:7879/callback',
        'expected-state',
      ),
    Error,
  );

  assertStringIncludes(error.message, 'OAuth error: access_denied');
  assertStringIncludes(error.message, 'User cancelled');
});

Deno.test('extractCodeFromRedirectNavigation throws on state mismatch', () => {
  const error = assertThrows(
    () =>
      extractCodeFromRedirectNavigation(
        'http://localhost:7879/callback?code=abc123&state=other-state',
        'http://localhost:7879/callback',
        'expected-state',
      ),
    Error,
  );

  assertStringIncludes(error.message, 'State mismatch');
});
