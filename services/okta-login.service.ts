import { OktaAuth } from '@okta/okta-auth-js';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface OktaLoginConfig {
  issuer: string;
  clientId: string;
  scope: string;
  redirectUri: string;
}

export interface LoginTokens {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export class OktaLoginService {
  private oktaAuth: OktaAuth;

  constructor(config: OktaLoginConfig) {
    this.oktaAuth = new OktaAuth({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: config.scope.split(' '),
      // Enable PKCE for server-side usage
      pkce: true,
      // Disable token verification to avoid PEM key issues
      tokenManager: {
        autoRenew: false,
        autoRemove: false,
        storage: 'memory',
      },
      // Use memory storage for server environment
      storageManager: {
        token: {
          storageType: 'memory',
        },
        cache: {
          storageType: 'memory',
        },
        'okta-cache-storage': {
          storageType: 'memory',
        },
      },
      // Keep JWT signature verification enabled.
      ignoreSignature: false,
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginTokens> {
    try {
      const transaction = await this.oktaAuth.idx.authenticate({
        username: credentials.username,
        password: credentials.password,
        rememberMe: false,
        scopes: this.oktaAuth.options.scopes,
      });

      if (transaction.status === 'SUCCESS') {
        // Wait for tokens to be stored (similar to the app)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Try multiple ways to get the access token
        let accessToken = this.oktaAuth.getAccessToken();

        if (!accessToken) {
          // Check if tokens are in the transaction response
          if (transaction.tokens) {
            accessToken = transaction.tokens.accessToken?.accessToken;
          }
        }

        if (!accessToken) {
          const tokens = this.oktaAuth.tokenManager.getTokensSync();
          if (tokens?.accessToken) {
            accessToken = tokens.accessToken.accessToken;
          }
        }

        if (!accessToken) {
          const allTokens = await this.oktaAuth.tokenManager.getTokens();
          if (allTokens.accessToken) {
            accessToken = allTokens.accessToken.accessToken;
          }
        }

        if (!accessToken) {
          throw new Error(
            'No access token received - authentication may have succeeded but token storage failed',
          );
        }

        // Get ID token as well
        let idToken = this.oktaAuth.getIdToken();

        if (!idToken) {
          if (transaction.tokens) {
            idToken = transaction.tokens.idToken?.idToken;
          }
        }

        if (!idToken) {
          const tokens = this.oktaAuth.tokenManager.getTokensSync();
          if (tokens?.idToken) {
            idToken = tokens.idToken.idToken;
          }
        }

        if (!idToken) {
          const allTokens = await this.oktaAuth.tokenManager.getTokens();
          if (allTokens.idToken) {
            idToken = allTokens.idToken.idToken;
          }
        }

        if (!idToken) {
          throw new Error(
            'No ID token received - authentication may have succeeded but ID token storage failed',
          );
        }

        return {
          access_token: accessToken,
          id_token: idToken,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: this.oktaAuth.options.scopes?.join(' ') || 'openid profile email',
          refresh_token: undefined,
        };
      } else if (transaction.status === 'PENDING') {
        if (transaction.nextStep?.name === 'authenticator-verification-data') {
          // For CLI, we need to prompt for the verification code
          // Since Deno doesn't have a built-in prompt in this context, we'll throw an error with instructions
          throw new Error(
            `Email verification required. Please check your email and use the verification code. For CLI automation, consider using a different authentication method or configuring Okta to skip email verification for this user.`,
          );
        } else {
          throw new Error(
            `Authentication incomplete - status: ${transaction.status}, next step: ${transaction.nextStep?.name}`,
          );
        }
      } else {
        throw new Error(`Login failed with status: ${transaction.status}`);
      }
    } catch (error) {
      // Handle specific JWT verification errors
      if (error instanceof Error && error.message.includes('invalid PEM public key')) {
        throw new Error(
          'JWT verification failed while processing Okta tokens. Check network connectivity and Okta key-discovery configuration.',
        );
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.oktaAuth.signOut();
  }

  getUserInfo(): Promise<Record<string, unknown> | null> {
    return this.oktaAuth.getUser();
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.oktaAuth.isAuthenticated();
  }
}
