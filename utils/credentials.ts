export interface CredentialData {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  timestamp: string;
}

function getCredentialPaths(): { dir: string; file: string } {
  const home = Deno.env.get('HOME');
  if (!home) {
    throw new Error('HOME environment variable is not set');
  }
  const dir = `${home}/.nuewframe`;
  return { dir, file: `${dir}/credential.json` };
}

/** Load tokens from ~/.nuewframe/credential.json. */
export async function loadCredentials(): Promise<CredentialData> {
  const { file } = getCredentialPaths();

  try {
    const credentialContent = await Deno.readTextFile(file);
    return JSON.parse(credentialContent) as CredentialData;
  } catch (error) {
    throw new Error(
      `Failed to load credentials from ${file}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/** Persist tokens to ~/.nuewframe/credential.json. */
export async function saveCredentials(
  tokens: Omit<CredentialData, 'timestamp'>,
): Promise<void> {
  const { dir, file } = getCredentialPaths();

  try {
    await Deno.mkdir(dir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw new Error(
        `Failed to create credential directory: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const credentialData: CredentialData = {
    ...tokens,
    timestamp: new Date().toISOString(),
  };

  await Deno.writeTextFile(file, JSON.stringify(credentialData, null, 2));
}
