import {
  Collection,
  GuildMember,
  Message,
  MessageActionRow,
  SelectMenuInteraction
} from 'discord.js';
import { logErrors } from '@services/utilities/log-errors';
import { editMessage } from '@services/utilities/edit-message';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { collectorSelectMenu } from '@components/collectors';
import { selectTableRow } from '@components/actionRows';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { messageListPlayers } from '@models/messages/MessageListPlayers';

const { selectMenuIds, roles } = identifiers;
const { generalMessages, listPlayersMessages } = messages;

const execute = async (message: Message) => {
  try {
    const user = message.author;
    const reply = await message.reply({
      content: `${message.author}`
    });
    let currentTable: Table;
    let players: GuildMember[];

    const editMessageRelay = async (
      details: string,
      actionRow?: MessageActionRow | false
    ) => {
      await editMessage.textAndActionRow(
        reply,
        await messageListPlayers(details, currentTable, players),
        actionRow
      );
    };

    const getPlayers = async () => {
      const { guild } = message;
      if (!guild) {
        return;
      }
      const fetched = await Promise.all(
        guild.members.cache.map((member) => {
          if (member.roles.cache.has(currentTable.roleId)) {
            return member;
          }
          return undefined;
        })
      );
      const filtered = fetched.filter((member) => member !== undefined);
      players = [...(filtered as GuildMember[])];
      await editMessageRelay(listPlayersMessages.success, false);
    };

    const checkTables = async () => {
      const tablesFromDb = await mongodbUtils.getTablesByMaster(user.id);
      if (!tablesFromDb || !tablesFromDb.length) {
        await editMessageRelay(listPlayersMessages.noTable, false);
        return;
      }
      if (tablesFromDb.length === 1) {
        currentTable = Object.assign(
          JSON.parse(JSON.stringify(tablesFromDb[0]))
        );
        // EXIT POINT.
        await getPlayers();
        return;
      }
      await editMessageRelay(
        listPlayersMessages.selectTable,
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
            await editMessageRelay(listPlayersMessages.canceled, false);
            return;
          }
          const selectedTable = tablesFromDb.find(
            (table) => table.name === interaction.values[0]
          );
          currentTable = Object.assign(
            JSON.parse(JSON.stringify(selectedTable))
          );
          // EXIT POINT.
          await getPlayers();
        }
      );
    };

    await checkTables();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'ls',
  aliases: ['listar', 'list'],
  description: 'Lista todos os jogadores da sua mesa.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.master,
  execute
};

export { command };
