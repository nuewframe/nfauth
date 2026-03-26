import { decodeJwtPayload } from '../utils/jwt.ts';

export interface OktaConfig {
  domain: string;
  clientId: string;
  apiToken: string;
  redirectUri: string;
  scope?: string;
  authorizationServerId?: string;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export interface AuthorizeUrlParams {
  responseType?: string;
  state?: string;
  nonce?: string;
  /** S256 code_challenge for PKCE (RFC 7636). When present, code_challenge_method=S256 is also added. */
  codeChallenge?: string;
}

export class OktaService {
  private config: OktaConfig;

  constructor(config: OktaConfig) {
    this.config = {
      ...config,
      scope: config.scope || 'openid profile email',
    };
  }

  /**
   * Generate the authorization URL for the OAuth 2.0 flow
   */
  getAuthorizeUrl(params: AuthorizeUrlParams = {}): string {
    const {
      responseType = 'code',
      state = this.generateRandomString(),
      nonce = this.generateRandomString(),
      codeChallenge,
    } = params;

    const url = new URL(`${this.getIssuerBaseUrl()}/v1/authorize`);

    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('response_type', responseType);
    url.searchParams.set('scope', this.config.scope ?? 'openid profile email');
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    if (codeChallenge) {
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }

    return url.toString();
  }

  /**
   * Exchange authorization code for tokens
   */
  /**
   * Exchange an authorization code for tokens.
   * Pass `codeVerifier` when using PKCE (public client); omit for confidential clients
   * where `apiToken` is used as the client_secret.
   */
  async exchangeCodeForTokens(code: string, codeVerifier?: string): Promise<TokenResponse> {
    const tokenUrl = `${this.getIssuerBaseUrl()}/v1/token`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code: code,
      redirect_uri: this.config.redirectUri,
    });

    if (codeVerifier) {
      body.set('code_verifier', codeVerifier);
    } else {
      body.set('client_secret', this.config.apiToken);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`);
    }

    return (await response.json()) as TokenResponse;
  }

  /**
   * Get tokens using client credentials flow (for server-to-server authentication)
   */
  async getClientCredentialsTokens(scope?: string): Promise<TokenResponse> {
    const tokenUrl = `${this.getIssuerBaseUrl()}/v1/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: scope || this.config.scope || 'openid profile email',
    });

    const credentials = btoa(`${this.config.clientId}:${this.config.apiToken}`);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get client credentials tokens: ${response.status} ${errorText}`);
    }

    return (await response.json()) as TokenResponse;
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const tokenUrl = `${this.getIssuerBaseUrl()}/v1/token`;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const credentials = btoa(`${this.config.clientId}:${this.config.apiToken}`);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
    }

    return (await response.json()) as TokenResponse;
  }

  /**
   * Validate and decode an ID token (basic validation - for production use a proper JWT library)
   */
  decodeIdToken(idToken: string): Record<string, unknown> {
    try {
      return decodeJwtPayload(idToken);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to decode ID token: ${error.message}`);
      }
      throw new Error('Failed to decode ID token');
    }
  }

  /**
   * Extract issuer from JWT token
   */
  private extractIssuerFromToken(token: string): string | null {
    try {
      const payload = decodeJwtPayload(token);
      const issuer = payload.iss;
      return typeof issuer === 'string' ? issuer : null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get user information using the access token
   */
  async getUserInfo(accessToken: string): Promise<Record<string, unknown>> {
    // Try to extract issuer from token first
    const tokenIssuer = this.extractIssuerFromToken(accessToken);
    const domain = tokenIssuer || this.config.domain;

    // Construct the user-info URL correctly
    let userInfoUrl: string;
    if (domain.includes('/oauth2/')) {
      // If domain already includes /oauth2/, just add /v1/userinfo
      userInfoUrl = `${domain}/v1/userinfo`;
    } else {
      // Otherwise, use configured authorization server (default when not provided)
      const authServer = this.config.authorizationServerId || 'default';
      userInfoUrl = `${domain}/oauth2/${authServer}/v1/userinfo`;
    }

    const response = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user info: ${response.status} ${errorText}`);
    }

    return (await response.json()) as Record<string, unknown>;
  }

  /**
   * Generate a random string for state and nonce parameters
   */
  private generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getIssuerBaseUrl(): string {
    if (this.config.domain.includes('/oauth2/')) {
      return this.config.domain;
    }

    const authServer = this.config.authorizationServerId || 'default';
    return `${this.config.domain}/oauth2/${authServer}`;
  }
}
