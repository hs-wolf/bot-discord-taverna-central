import path from 'path';
import { Client, Intents } from 'discord.js';
import { logErrors } from '@services/utilities/log-errors';

const client = new Client({
  shardCount: 1,
  allowedMentions: {
    repliedUser: true
  },
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  partials: ['CHANNEL']
});

const execute = async () => {
  const token: string =
    process.env.APP_ENV === 'dev'
      ? (process.env.BOT_TOKEN_DEV as string)
      : (process.env.BOT_TOKEN_PROD as string);

  try {
    await client.login(token);
    // eslint-disable-next-line no-console
    console.log(`Connected to Discord.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type ConnectDiscord = Service & {
  execute: () => Promise<void>;
};
const connectDiscord: ConnectDiscord = {
  name: path.basename(__filename, path.extname(__filename)),
  description: `Service that connects the app to Discord's API.`,
  execute
};

export { connectDiscord, client };
