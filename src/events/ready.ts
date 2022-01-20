import { Client } from 'discord.js';
import { logErrors } from '@services/utilities/log-errors';

const execute = async (client: Client) => {
  try {
    const { tag } = client.user!;
    const { size } = client.guilds.cache;
    if (!tag || !size) {
      throw Error('Discord client corrupted or unavailable.');
    }
    // eslint-disable-next-line no-console
    console.log(`Logged in as: ${tag}, to ${size} servers.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const event: Event = {
  name: 'ready',
  description: 'Event called once after bot is ready to use.',
  once: true,
  execute
};

export { event };
