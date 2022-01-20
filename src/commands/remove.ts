import {
  Collection,
  Guild,
  GuildMember,
  Message,
  MessageActionRow,
  SelectMenuInteraction
} from 'discord.js';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { logErrors } from '@services/utilities/log-errors';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { editMessage } from '@services/utilities/edit-message';
import { messageRemovePlayer } from '@models/messages/MessageRemovePlayer';
import {
  cancelButtonRow,
  confirmButtonsRow,
  selectTableRow
} from '@components/actionRows';
import {
  collectorButtons,
  collectorMessage,
  collectorSelectMenu
} from '@components/collectors';
import { discordUtils } from '@services/utilities/discord-utils';

const { roles, customEmojis, buttonIds, selectMenuIds } = identifiers;
const { errorMessages, generalMessages, removePlayerMessages } = messages;

const execute = async (message: Message, argList: string[]) => {
  try {
    let currentTable: Table;
    let playersQueue: GuildMember[] | undefined;
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
        await messageRemovePlayer(details, currentTable),
        actionRow
      );
    };

    const removeRoles = async (tableGuild: Guild) => {
      const loadingEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadingEmoji} ${removePlayerMessages.removing}`;
      await editMessageRelay(details, false);
      const role = await discordUtils.getRole(tableGuild, currentTable.roleId);
      if (!role) {
        await editMessageRelay(errorMessages.unexpected, false);
        return;
      }
      await Promise.all(
        playersQueue!.map(async (player) => {
          await player.roles.remove(role);
        })
      );
      await editMessageRelay(
        `${removePlayerMessages.success} ${playersQueue!.join(' ')}`
      );
    };

    const confirmRemove = async (tableGuild: Guild) => {
      const details = `${removePlayerMessages.confirm} ${playersQueue!.join(
        ' '
      )}`;
      await editMessageRelay(details, confirmButtonsRow);
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on('end', async (collected) => {
        const interaction = collected.first()!;
        if (!interaction) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (interaction.customId === buttonIds.confirmYes) {
          // EXIT POINT.
          await removeRoles(tableGuild);
          return;
        }
        await editMessageRelay(removePlayerMessages.canceled, false);
      });
    };

    const selectPlayers = async () => {
      const tableGuild = await discordUtils.getGuild(currentTable.serverId);
      if (!tableGuild) {
        await editMessageRelay(errorMessages.unexpected, false);
        return;
      }
      if (argList.length) {
        const slicedIds = argList.map((arg) => {
          if (arg.startsWith('<@!') && arg.endsWith('>')) {
            return arg.slice(3, -1);
          }
          return arg;
        });
        playersQueue = await discordUtils.getMembers(slicedIds, tableGuild);
        if (!playersQueue) {
          await editMessageRelay(removePlayerMessages.notFound, false);
          return;
        }
        playersQueue.filter((member) => member !== undefined);
        if (!playersQueue.length) {
          await editMessageRelay(removePlayerMessages.notFound, false);
          return;
        }
        // EXIT POINT.
        await confirmRemove(tableGuild);
        return;
      }
      await editMessageRelay(
        removePlayerMessages.selectPlayers,
        cancelButtonRow
      );
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const slicedIds = msg.content.split(' ').map((arg) => {
          if (arg.startsWith('<@!') && arg.endsWith('>')) {
            return arg.slice(3, -1);
          }
          return arg;
        });
        playersQueue = await discordUtils.getMembers(slicedIds, tableGuild);
        if (!playersQueue) {
          await editMessageRelay(removePlayerMessages.notFound, false);
          return;
        }
        playersQueue.filter((member: GuildMember) => member !== undefined);
        if (!playersQueue.length) {
          await editMessageRelay(removePlayerMessages.notFound, false);
          return;
        }
        await msg.delete();
        collInteractions.stop();
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && (!playersQueue || !playersQueue.length)) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!playersQueue || !playersQueue.length) {
          await editMessageRelay(removePlayerMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await confirmRemove(tableGuild);
      });
    };

    const checkTables = async () => {
      const tablesFromDb = await mongodbUtils.getTablesByMaster(user.id);
      if (!tablesFromDb || !tablesFromDb.length) {
        await editMessageRelay(removePlayerMessages.noTable, false);
        return;
      }
      if (tablesFromDb.length === 1) {
        currentTable = Object.assign(
          JSON.parse(JSON.stringify(tablesFromDb[0]))
        );
        // EXIT POINT.
        await selectPlayers();
        return;
      }
      await editMessageRelay(
        removePlayerMessages.selectTable,
        selectTableRow(tablesFromDb)
      );
      const collInteractions = collectorSelectMenu(user, reply);
      collInteractions.on(
        'end',
        async (collected: Collection<string, SelectMenuInteraction>) => {
          const interaction = collected.first()!;
          if (!interaction) {
            await editMessageRelay(generalMessages.inactivity, false);
            return;
          }
          if (interaction.values[0] === selectMenuIds.cancel) {
            await editMessageRelay(removePlayerMessages.canceled, false);
            return;
          }
          const selectedTable = tablesFromDb.find(
            (table) => table.name === interaction.values[0]
          );
          currentTable = Object.assign(
            JSON.parse(JSON.stringify(selectedTable))
          );
          // EXIT POINT.
          await selectPlayers();
        }
      );
    };

    await checkTables();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'remover',
  aliases: ['rm', 'remove'],
  description: 'Remove um ou vários players da sua mesa.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.master,
  guildOnly: true,
  usage: 'opcional:<@membro1> <@membro2> <@membro3>',
  execute
};

export { command };
