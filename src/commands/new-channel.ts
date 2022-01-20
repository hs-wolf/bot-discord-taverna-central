import {
  CategoryChannel,
  Collection,
  Message,
  MessageActionRow,
  OverwriteResolvable,
  SelectMenuInteraction
} from 'discord.js';
import { confirmButtonsRow, selectTableRow } from '@components/actionRows';
import { collectorButtons, collectorSelectMenu } from '@components/collectors';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import {
  allPermissions,
  categoryPlayerPermissions,
  categorySpectatorPermissions,
  channelsMasterPermissions
} from '@components/permissions';
import { messageNewChannel } from '@models/messages/MessageNewChannel';
import { editMessage } from '@services/utilities/edit-message';
import { discordUtils } from '@services/utilities/discord-utils';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { logErrors } from '@services/utilities/log-errors';

const {
  selectMenuIds,
  channelLabels,
  buttonIds,
  customEmojis,
  channelTypes,
  roles
} = identifiers;
const { errorMessages, generalMessages, newChannelMessages } = messages;

const execute = async (message: Message, argList: string[]) => {
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
        await messageNewChannel(details, currentTable),
        actionRow
      );
    };

    const createChannel = async () => {
      const loadingEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadingEmoji} ${newChannelMessages.creating}`;
      await editMessageRelay(details, false);

      const guild = await discordUtils.getGuild(currentTable.serverId);
      if (!guild) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Could not find guild.');
      }
      const category = await discordUtils.getChannel(
        currentTable.categoryChannelId
      );
      if (!category) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Could not find category channel.');
      }
      const contributor = (await discordUtils.getRoles(
        guild,
        Object.values(roles.contributors)
      ))![0];
      if (!contributor) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Could not find contributor role.');
      }
      const newChannelOverwrites: OverwriteResolvable[] = [
        {
          id: guild.id,
          deny: allPermissions
        },
        {
          id: currentTable.masterId,
          allow: channelsMasterPermissions
        },
        {
          id: currentTable.roleId,
          allow: categoryPlayerPermissions
        },
        {
          id: currentTable.spectatorRoleId,
          allow: categorySpectatorPermissions
        },
        {
          id: contributor.id,
          allow: categorySpectatorPermissions
        }
      ];
      const spectatortOverwrites: OverwriteResolvable[] = [
        {
          id: guild.id,
          deny: allPermissions
        },
        {
          id: currentTable.masterId,
          allow: channelsMasterPermissions
        },
        {
          id: currentTable.roleId,
          allow: categoryPlayerPermissions
        },
        {
          id: currentTable.spectatorRoleId,
          allow: categoryPlayerPermissions
        },
        {
          id: contributor.id,
          allow: categoryPlayerPermissions
        }
      ];
      let label: string;
      const type =
        argList[0] === 'texto'
          ? channelTypes.GUILD_TEXT
          : channelTypes.GUILD_VOICE;
      let overwrite: OverwriteResolvable[];
      if (argList[1] && argList[1] === 'aberto') {
        label =
          argList[0] === 'texto'
            ? channelLabels.generalSpec
            : channelLabels.sessionSpec;
        overwrite = spectatortOverwrites;
      } else {
        label =
          argList[0] === 'texto'
            ? channelLabels.general
            : channelLabels.session;
        overwrite = newChannelOverwrites;
      }
      const newChannel = await discordUtils.createChannel(
        guild,
        label,
        type,
        category as CategoryChannel,
        overwrite
      );
      if (!newChannel) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Could not create a new channel.');
      }
      await editMessageRelay(`${newChannelMessages.success} ${newChannel}`);
    };

    const confirmAdd = async () => {
      const details = `${newChannelMessages.confirm} ${
        argList[0] === 'texto' ? '**Texto**' : '**Voz**'
      } ${
        argList[1] && argList[1] === 'aberto' ? '**Aberto**' : '**Privado**'
      }`;
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
          await createChannel();
          return;
        }
        await editMessageRelay(newChannelMessages.canceled, false);
      });
    };

    const checkTables = async () => {
      const tablesFromDb = await mongodbUtils.getTablesByMaster(user.id);
      if (!tablesFromDb || !tablesFromDb.length) {
        await editMessageRelay(newChannelMessages.noTable, false);
        return;
      }
      if (tablesFromDb.length === 1) {
        currentTable = Object.assign(
          JSON.parse(JSON.stringify(tablesFromDb[0]))
        );
        // EXIT POINT.
        await confirmAdd();
        return;
      }
      await editMessageRelay(
        newChannelMessages.selectTable,
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
            await editMessageRelay(newChannelMessages.canceled, false);
            return;
          }
          const selectedTable = tablesFromDb.find(
            (table) => table.name === interaction.values[0]
          );
          currentTable = Object.assign(
            JSON.parse(JSON.stringify(selectedTable))
          );
          // EXIT POINT.
          await confirmAdd();
        }
      );
    };

    await checkTables();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'novo',
  aliases: ['new'],
  description: 'Cria um novo canal para sua mesa.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.master,
  guildOnly: true,
  args: 1,
  usage: '<texto/voz> opcional:<aberto>',
  execute
};

export { command };
