import { Command } from '@cliffy/command';
import { OktaService } from '../services/okta.service.ts';
import { getCurrentOktaConfig, loadConfig, resolveConfigSelection } from '../config/app.config.ts';
import { loadCredentials } from '../utils/credentials.ts';
import { buildOktaServiceConfig } from '../utils/okta-service-options.ts';
import { createLoggerFromOptions, type LoggingOptions } from '../utils/logger.ts';

interface UserInfoOptions {
  env?: string;
  namespace?: string;
  logLevel?: string;
  verbose?: boolean;
}

export const userInfoCommand = new Command()
  .description('Get user information using access token')
  .arguments('[token:string]')
  .action(async (options, token) => {
    const logger = createLoggerFromOptions(options as unknown as LoggingOptions);
    try {
      const commandOptions = options as unknown as UserInfoOptions;
      const config = loadConfig();
      const selection = resolveConfigSelection(
        config,
        commandOptions.env,
        commandOptions.namespace,
      );
      const oktaConfig = getCurrentOktaConfig(config, selection.env, selection.namespace);

      const oktaServiceConfig = buildOktaServiceConfig(oktaConfig);

      const oktaService = new OktaService(oktaServiceConfig);

      let tokenToUse: string;
      let tokenType: string;

      if (token) {
        // Token provided as argument
        tokenToUse = token;
        tokenType = 'provided token';
      } else {
        // Load token from credential file
        const credentials = await loadCredentials();

        if (!credentials.access_token) {
          throw new Error('No access token found in credential file');
        }
        tokenToUse = credentials.access_token;
        tokenType = 'access token from credential file';
      }

      logger.info('Getting user information...');
      logger.info(`Environment: ${selection.env}`);
      logger.info(`Namespace: ${selection.namespace}`);
      logger.info(`Domain: ${oktaConfig.domain}`);
      logger.info(`Using: ${tokenType}`);

      const userInfo = await oktaService.getUserInfo(tokenToUse);

      logger.success('User information retrieved');
      console.log(JSON.stringify(userInfo, null, 2));
    } catch (error) {
      logger.error(
        'Failed to get user information:',
        error instanceof Error ? error.message : String(error),
      );
      logger.info('Usage: user-info <token> or user-info (uses credential file access token)');
      logger.info('Make sure your config is set up and token is valid/non-expired.');
      Deno.exit(1);
    }
  });
