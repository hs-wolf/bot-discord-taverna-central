import {
  ButtonInteraction,
  CategoryChannel,
  Collection,
  Message,
  MessageActionRow
} from 'discord.js';
import { collectorButtons } from '@components/collectors';
import { confirmButtonsRow } from '@components/actionRows';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { discordUtils } from '@services/utilities/discord-utils';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { messageDeleteTable } from '@models/messages/MessageDeleteTable';
import { TableSchema } from '@models/Schemas/TableSchema';
import { editMessage } from '@services/utilities/edit-message';
import { logErrors } from '@services/utilities/log-errors';

const { buttonIds, customEmojis, roles } = identifiers;
const { generalMessages, errorMessages, deleteTableMessages } = messages;

const execute = async (message: Message, argList?: string[]) => {
  try {
    let currentTable: Table;
    const user = message.author;
    const reply = await message.reply({
      content: `${message.author}`
    });

    const editMessageRelay = async (
      details: string,
      actionRow?: MessageActionRow | false
    ) => {
      await editMessage.textAndActionRow(
        reply,
        await messageDeleteTable(details, currentTable),
        actionRow
      );
    };
    const executeDelete = async () => {
      const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadEmoji} Excluíndo mesa...`;
      await editMessageRelay(details, false);

      const tableCategory = await discordUtils.getChannel(
        currentTable.categoryChannelId
      );
      const categoryChildren = tableCategory
        ? [...(tableCategory as CategoryChannel).children.values()]
        : [];
      const tableRoles = await discordUtils.getRoles(reply.guild!, [
        currentTable.roleId,
        currentTable.spectatorRoleId
      ]);
      if (tableRoles && tableRoles.length) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const role of tableRoles) {
          if (role) {
            await role.delete();
          }
        }
      }
      if (categoryChildren) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const child of categoryChildren) {
          if (child) {
            await child.delete();
          }
        }
      }
      if (tableCategory) {
        tableCategory.delete();
      }
      const removedTable = await TableSchema.findOneAndDelete({
        name: currentTable.name
      }).exec();
      if (!removedTable) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Could not sync to database.');
      }
      await editMessageRelay(deleteTableMessages.success);
    };
    const confirmDelete = async () => {
      await editMessageRelay(deleteTableMessages.confirm, confirmButtonsRow);
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on(
        'end',
        async (collected: Collection<string, ButtonInteraction>) => {
          const interaction = collected.first();
          if (!interaction) {
            await editMessageRelay(generalMessages.inactivity, false);
            return;
          }
          if (interaction.customId === buttonIds.confirmYes) {
            // EXIT POINT
            await executeDelete();
            return;
          }
          await editMessageRelay(deleteTableMessages.canceled, false);
        }
      );
    };
    const getTable = async () => {
      if (!argList) {
        await editMessageRelay(deleteTableMessages.noMention);
        return;
      }
      const tableFromDb = await mongodbUtils.getTableByName(
        argList.join(' ').toLowerCase()
      );
      if (!tableFromDb) {
        await editMessageRelay(deleteTableMessages.dontExist);
        return;
      }
      currentTable = Object.assign(JSON.parse(JSON.stringify(tableFromDb)));
      // EXIT POINT.
      await confirmDelete();
    };

    await getTable();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'deletar',
  aliases: ['del', 'delete'],
  description: 'Deleta uma mesa de um mestre.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.sectorAdministration,
  guildOnly: true,
  args: 1,
  usage: '<nome da mesa>',
  execute
};

export { command };
