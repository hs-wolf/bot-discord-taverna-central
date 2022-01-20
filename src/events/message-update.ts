import { Message } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { validateCommand } from '@services/utilities/validate-command';
import { logErrors } from '@services/utilities/log-errors';

const { config } = identifiers;

const execute = async (oldMessage: Message, newMessage: Message) => {
  try {
    if (oldMessage.author.bot) {
      return;
    }
    if (newMessage.content.startsWith(config.defaultPrefix)) {
      const validation = await validateCommand.validate(
        newMessage,
        config.defaultPrefix
      );
      if (validation.protected) {
        return;
      }
      if (!validation.done) {
        await newMessage.reply({
          content: `${newMessage.author} ${validation.reason}`
        });
        return;
      }
      if (validation.command) {
        validation.command.execute(newMessage, validation.args);
      }
    }
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const event: Event = {
  name: 'messageUpdate',
  description: 'Event called when a message is edited.',
  once: false,
  execute
};

export { event };
