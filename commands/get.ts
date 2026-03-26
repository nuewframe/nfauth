import { Command } from '@cliffy/command';
import { loadCredentials } from '../utils/credentials.ts';
import { createLoggerFromOptions, type LoggingOptions } from '../utils/logger.ts';

export const getCommand = new Command().description('Get various information from Okta').command(
  'access-token',
  new Command().description('Get the current access token from credentials').action(
    async (options) => {
      const logger = createLoggerFromOptions(options as unknown as LoggingOptions);
      try {
        const credentials = await loadCredentials();

        if (!credentials.access_token) {
          throw new Error('No access token found in credential file');
        }

        console.log(credentials.access_token);
      } catch (error) {
        logger.error(
          'Failed to get access token:',
          error instanceof Error ? error.message : String(error),
        );
        logger.info('Make sure:');
        logger.info('1. Your configuration is set up: okta-client config init');
        logger.info('2. You have logged in: okta-client login <username>');
        logger.info('3. The credential file exists at ~/.nuewframe/credential.json');
        Deno.exit(1);
      }
    },
  ),
);
