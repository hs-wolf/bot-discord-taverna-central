import { Message, MessageActionRow } from 'discord.js';
import path from 'path';
import { logErrors } from '@services/utilities/log-errors';

const textAndActionRow = async (
  message: Message,
  content: string,
  actionRow?: MessageActionRow | false
) => {
  try {
    if (actionRow === false) {
      await message.edit({ components: [] });
    } else if (actionRow) {
      await message.edit({ components: [actionRow] });
    }
    await message.edit({
      content
    });
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type EditMessage = Service & {
  textAndActionRow: (
    message: Message,
    content: string,
    actionRow?: MessageActionRow | false
  ) => Promise<void>;
};

const editMessage: EditMessage = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Service that edits a specific Discord Message.',
  textAndActionRow
};

export { editMessage };
