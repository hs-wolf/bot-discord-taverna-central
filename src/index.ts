import path from 'path';
import { config } from 'dotenv';
import { connectDiscord } from '@services/setup/connect-discord';
import { connectMongoDB } from '@services/setup/connect-mongodb';
import { fetchCommands } from '@services/setup/fetch-commands';
import { registerEvents } from '@services/setup/register-events';
import { setComponents } from '@services/setup/set-components';
import { logErrors } from '@services/utilities/log-errors';

config({
  path: path.join(path.resolve(), '.env')
});

const initialize = async () => {
  try {
    setComponents.execute();
    await fetchCommands.execute();
    await registerEvents.execute();
    await connectDiscord.execute();
    await connectMongoDB.execute();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

initialize();
