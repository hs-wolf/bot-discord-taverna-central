import { Message } from 'discord.js';
import { logErrors } from '@services/utilities/log-errors';

const execute = async (message: Message) => {
  try {
    const description = `Pong! A latência é de **${message.client.ws.ping}ms**.`;
    await message.reply({ content: `${message.author} ${description}` });
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'ping',
  aliases: ['pong'],
  description: 'Mostra o ping do bot.',
  protections: new Map(),
  cooldowns: new Map(),
  execute
};

export { command };
