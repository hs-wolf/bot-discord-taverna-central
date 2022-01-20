import { Message } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { validateCommand } from '@services/utilities/validate-command';
import { logErrors } from '@services/utilities/log-errors';

const { config } = identifiers;

const execute = async (message: Message) => {
  try {
    if (message.author.bot) {
      return;
    }
    if (message.content.startsWith(config.defaultPrefix)) {
      const validation = await validateCommand.validate(
        message,
        config.defaultPrefix
      );
      if (validation.protected) {
        return;
      }
      if (!validation.done) {
        await message.reply({
          content: `${message.author} ${validation.reason}`
        });
        return;
      }
      if (validation.command) {
        validation.command.execute(message, validation.args);
      }
    }
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const event: Event = {
  name: 'messageCreate',
  description: 'Event called when a message is sent.',
  once: false,
  execute
};

export { event };
