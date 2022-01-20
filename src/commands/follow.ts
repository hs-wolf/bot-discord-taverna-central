import {
  ButtonInteraction,
  Collection,
  GuildMember,
  Message,
  MessageActionRow,
  Role
} from 'discord.js';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { logErrors } from '@services/utilities/log-errors';
import { editMessage } from '@services/utilities/edit-message';
import { messageFollowTable } from '@models/messages/MessageFollowTable';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { confirmButtonsRow } from '@components/actionRows';
import { collectorButtons } from '@components/collectors';
import { discordUtils } from '@services/utilities/discord-utils';

const { customEmojis, buttonIds } = identifiers;
const { errorMessages, generalMessages, followTableMessages } = messages;

const execute = async (message: Message, argList: string[]) => {
  try {
    const user = message.author;
    const reply = await message.reply({
      content: `${message.author}`
    });
    let currentTable: Table;
    let memberOnServer: GuildMember;
    let espectatorRole: Role;

    const editMessageRelay = async (
      details: string,
      actionRow?: MessageActionRow | false
    ) => {
      await editMessage.textAndActionRow(
        reply,
        await messageFollowTable(details, currentTable),
        actionRow
      );
    };

    const follow = async () => {
      const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
      await editMessageRelay(
        `${loadEmoji} ${followTableMessages.following}`,
        false
      );
      const gotRole = await memberOnServer.roles.add(espectatorRole);
      if (!gotRole) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Could not add role.');
      }
      await editMessageRelay(followTableMessages.successFollow);
    };

    const unfollow = async () => {
      const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
      await editMessageRelay(
        `${loadEmoji} ${followTableMessages.unollowing}`,
        false
      );
      const gotRole = await memberOnServer.roles.remove(espectatorRole);
      if (!gotRole) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Could not remove role.');
      }
      await editMessageRelay(followTableMessages.successUnfollow);
    };

    const confirmFollow = async () => {
      await editMessageRelay(
        followTableMessages.confirmFollow,
        confirmButtonsRow
      );
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
            await follow();
            return;
          }
          await editMessageRelay(followTableMessages.canceledFollow, false);
        }
      );
    };

    const confirmUnfollow = async () => {
      await editMessageRelay(
        followTableMessages.confirmUnfollow,
        confirmButtonsRow
      );
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
            await unfollow();
            return;
          }
          await editMessageRelay(followTableMessages.canceleUnfollow, false);
        }
      );
    };

    const getTable = async () => {
      const tableFromDb = await mongodbUtils.getTableByName(
        argList.join(' ').toLowerCase()
      );
      if (!tableFromDb) {
        await editMessageRelay(followTableMessages.dontExist);
        return;
      }
      currentTable = Object.assign(JSON.parse(JSON.stringify(tableFromDb)));
      if (!currentTable.spectatorAllowed) {
        await editMessageRelay(followTableMessages.notAllowed);
        return;
      }
      const guild = await discordUtils.getGuild(currentTable.serverId);
      if (!guild) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Servidor das mesa não encontrada.');
      }
      const member = guild.members.cache.get(user.id);
      if (!member) {
        await editMessageRelay(followTableMessages.notOnServer);
        return;
      }
      memberOnServer = member;
      const role = await discordUtils.getRole(
        guild,
        currentTable.spectatorRoleId
      );
      if (!role) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Espectator role not found.');
      }
      espectatorRole = role;

      if (!member.roles.cache.has(role.id)) {
        // EXIT POINT.
        await confirmFollow();
        return;
      }
      // EXIT POINT.
      await confirmUnfollow();
    };

    await getTable();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'seguir',
  aliases: ['follow'],
  description: 'Adiciona o cargo de espectador para a mesa selecionada.',
  protections: new Map(),
  cooldowns: new Map(),
  guildOnly: true,
  args: 1,
  usage: '<nome da mesa>',
  execute
};

export { command };
