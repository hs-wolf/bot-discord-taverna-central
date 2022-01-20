import { Message } from 'discord.js';
import { logErrors } from '@services/utilities/log-errors';

const execute = async (message: Message) => {
  try {
    await message.reply({
      content: `${message.author} Este comando está em manutenção.`
    });
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'help',
  aliases: ['h', 'ajuda'],
  description: 'Mostra um menu rápido de ajuda.',
  protections: new Map(),
  cooldowns: new Map(),
  execute
};

export { command };
