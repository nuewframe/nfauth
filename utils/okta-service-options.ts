import type { OktaEnvironment } from '../config/app.config.ts';
import type { OktaConfig } from '../services/okta.service.ts';

/** Build a normalized OktaService config from selected environment settings. */
export function buildOktaServiceConfig(
  oktaEnv: OktaEnvironment,
  scopeOverride?: string,
): OktaConfig {
  if (!oktaEnv.redirectUri) {
    throw new Error(
      'Missing redirectUri in selected Okta configuration. Set redirectUri in config.yaml for this env/namespace.',
    );
  }

  return {
    domain: oktaEnv.domain,
    clientId: oktaEnv.clientId,
    apiToken: oktaEnv.apiToken,
    redirectUri: oktaEnv.redirectUri,
    scope: scopeOverride || oktaEnv.scope || 'openid profile email',
    authorizationServerId: oktaEnv.authorizationServerId,
  };
}
