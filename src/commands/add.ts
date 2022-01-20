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
import { messageAddPlayer } from '@models/messages/MessageAddPlayer';
import { logErrors } from '@services/utilities/log-errors';
import { editMessage } from '@services/utilities/edit-message';
import {
  collectorButtons,
  collectorMessage,
  collectorSelectMenu
} from '@components/collectors';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { discordUtils } from '@services/utilities/discord-utils';
import {
  cancelButtonRow,
  confirmButtonsRow,
  selectTableRow
} from '@components/actionRows';

const { roles, customEmojis, buttonIds, selectMenuIds } = identifiers;
const { errorMessages, generalMessages, addPlayerMessages } = messages;

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
        await messageAddPlayer(details, currentTable),
        actionRow
      );
    };

    const giveRoles = async (tableGuild: Guild) => {
      const loadingEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadingEmoji} ${addPlayerMessages.adding}`;
      await editMessageRelay(details, false);
      const role = await discordUtils.getRole(tableGuild, currentTable.roleId);
      if (!role) {
        await editMessageRelay(errorMessages.unexpected, false);
        return;
      }
      await Promise.all(
        playersQueue!.map(async (player) => {
          await player.roles.add(role);
        })
      );
      await editMessageRelay(
        `${addPlayerMessages.success} ${playersQueue!.join(' ')}`
      );
    };

    const confirmAdd = async (tableGuild: Guild) => {
      const details = `${addPlayerMessages.confirm} ${playersQueue!.join(' ')}`;
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
          await giveRoles(tableGuild);
          return;
        }
        await editMessageRelay(addPlayerMessages.canceled, false);
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
          await editMessageRelay(addPlayerMessages.noPlayerFound, false);
          return;
        }
        playersQueue.filter((member) => member !== undefined);
        if (!playersQueue.length) {
          await editMessageRelay(addPlayerMessages.noPlayerFound, false);
          return;
        }
        // EXIT POINT.
        await confirmAdd(tableGuild);
        return;
      }
      await editMessageRelay(addPlayerMessages.selectPlayers, cancelButtonRow);
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
          await editMessageRelay(addPlayerMessages.noPlayerFound, false);
          return;
        }
        playersQueue.filter((member: GuildMember) => member !== undefined);
        if (!playersQueue.length) {
          await editMessageRelay(addPlayerMessages.noPlayerFound, false);
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
          await editMessageRelay(addPlayerMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await confirmAdd(tableGuild);
      });
    };

    const checkTables = async () => {
      const tablesFromDb = await mongodbUtils.getTablesByMaster(user.id);
      if (!tablesFromDb || !tablesFromDb.length) {
        await editMessageRelay(addPlayerMessages.noTable, false);
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
        addPlayerMessages.selectTable,
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
            await editMessageRelay(addPlayerMessages.canceled, false);
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
  name: 'add',
  aliases: ['adicionar'],
  description: 'Adiciona um ou vários players a sua mesa.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.master,
  guildOnly: true,
  usage: 'opcional:<@membro1> <@membro2> <@membro3>',
  execute
};

export { command };
