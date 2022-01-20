import { Message, MessageAttachment } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { logErrors } from '@services/utilities/log-errors';

const { roles } = identifiers;

const execute = async (message: Message, argList: string[]) => {
  try {
    const attachments = message.attachments.map((attachment) => {
      return new MessageAttachment(attachment.url);
    });
    await message.channel.send({
      content: argList.join(' '),
      files: [...attachments]
    });
    await message.delete();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'say',
  aliases: ['s', 'postar'],
  description: 'Posta uma mensagem pelo bot.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.sectorAdministration,
  guildOnly: true,
  execute
};

export { command };
