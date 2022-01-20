import emojiRegex from 'emoji-regex';
import {
  CategoryChannel,
  Channel,
  Guild,
  Message,
  MessageActionRow,
  OverwriteResolvable,
  Role,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import {
  collectorButtons,
  collectorMessage,
  collectorSelectMenu
} from '@components/collectors';
import {
  cancelButtonRow,
  selectButtonsRow,
  confirmButtonsRow,
  selectServerRow
} from '@components/actionRows';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import {
  allPermissions,
  categoryPlayerPermissions,
  channelsMasterPermissions,
  categorySpectatorPermissions
} from '@components/permissions';
import { discordUtils } from '@services/utilities/discord-utils';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import { editMessage } from '@services/utilities/edit-message';
import { messageCreateTable } from '@models/messages/MessageCreateTable';
import { messageMasterShield } from '@models/messages/MessageMasterShield';
import { TableSchema } from '@models/Schemas/TableSchema';
import { logErrors } from '@services/utilities/log-errors';

const {
  regex,
  config,
  channelTypes,
  channelLabels,
  servers,
  customEmojis,
  buttonIds,
  selectMenuIds,
  roles
} = identifiers;
const { generalMessages, errorMessages, createTableMessages } = messages;

const execute = async (message: Message) => {
  try {
    const newTable: Table = {
      serverId: '',
      masterId: '',
      name: '',
      emoji: '',
      imageLink: config.tableImageUrl,
      roleId: '',
      spectatorRoleId: '',
      categoryChannelId: '',
      shieldChannelId: '',
      shieldMessageId: '',
      spectatorAllowed: false,
      activityScore: 0,
      lastRpgDate: new Date()
    };
    let newInstances: (Role | Channel | undefined)[] = [];
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
        await messageCreateTable(details, newTable),
        actionRow
      );
    };
    const resetNewInstances = async () => {
      await Promise.all(
        newInstances.map(async (instance) => {
          if (instance) {
            return instance.delete();
          }
          return undefined;
        })
      );
      newInstances = [];
    };
    const syncToDatabase = async () => {
      const newTableDB = await new TableSchema({
        ...newTable
      }).save();
      if (!newTableDB) {
        await editMessageRelay(errorMessages.unexpected);
        throw Error('Could not sync to database.');
      }
      // EXIT POINT.
      await editMessageRelay(createTableMessages.success);
    };
    const createChannels = async (guild: Guild) => {
      const contributor = (await discordUtils.getRoles(
        guild,
        Object.values(roles.contributors)
      ))![0];
      if (!contributor) {
        await editMessageRelay(errorMessages.unexpected, false);
        await resetNewInstances();
        throw Error('Could not find contributor role.');
      }
      const categoryOverwrites: OverwriteResolvable[] = [
        {
          id: guild.id,
          deny: allPermissions
        },
        {
          id: newTable.roleId,
          allow: categoryPlayerPermissions
        },
        {
          id: newTable.spectatorRoleId,
          allow: categorySpectatorPermissions
        },
        {
          id: contributor.id,
          allow: categorySpectatorPermissions
        }
      ];
      const masterShieldOverwrites: OverwriteResolvable[] = [
        {
          id: guild.id,
          deny: allPermissions
        },
        {
          id: newTable.masterId,
          allow: categoryPlayerPermissions
        }
      ];
      const newChannelOverwrites: OverwriteResolvable[] = [
        {
          id: guild.id,
          deny: allPermissions
        },
        {
          id: newTable.masterId,
          allow: channelsMasterPermissions
        },
        {
          id: newTable.roleId,
          allow: categoryPlayerPermissions
        },
        {
          id: newTable.spectatorRoleId,
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
          id: newTable.masterId,
          allow: channelsMasterPermissions
        },
        {
          id: newTable.roleId,
          allow: categoryPlayerPermissions
        },
        {
          id: newTable.spectatorRoleId,
          allow: categoryPlayerPermissions
        },
        {
          id: contributor.id,
          allow: categoryPlayerPermissions
        }
      ];
      const category = await discordUtils.createChannel(
        guild,
        newTable.name,
        channelTypes.GUILD_CATEGORY,
        undefined,
        categoryOverwrites
      );
      const shield = (await discordUtils.createChannel(
        guild,
        channelLabels.masterShield,
        channelTypes.GUILD_TEXT,
        category as CategoryChannel,
        masterShieldOverwrites
      )) as TextChannel;
      const general = (await discordUtils.createChannel(
        guild,
        channelLabels.general,
        channelTypes.GUILD_TEXT,
        category as CategoryChannel,
        newChannelOverwrites
      )) as TextChannel;
      const session = (await discordUtils.createChannel(
        guild,
        `${newTable.emoji} ${channelLabels.session}`,
        channelTypes.GUILD_VOICE,
        category as CategoryChannel,
        newChannelOverwrites
      )) as VoiceChannel;
      if (!category || !shield || !general || !session) {
        await editMessageRelay(errorMessages.unexpected, false);
        await resetNewInstances();
        throw Error('One of the main channels was not created.');
      }
      newInstances.push(category);
      newInstances.push(shield);
      newInstances.push(general);
      newInstances.push(session);
      newTable.categoryChannelId = category.id;
      newTable.shieldChannelId = shield.id;
      if (newTable.spectatorAllowed) {
        const spectatorGeneral = (await discordUtils.createChannel(
          guild,
          channelLabels.generalSpec,
          channelTypes.GUILD_TEXT,
          category.id,
          spectatortOverwrites
        )) as TextChannel;
        const spectatorSession = (await discordUtils.createChannel(
          guild,
          `${newTable.emoji} ${channelLabels.sessionSpec}`,
          channelTypes.GUILD_VOICE,
          category.id,
          spectatortOverwrites
        )) as VoiceChannel;
        newInstances.push(spectatorGeneral);
        newInstances.push(spectatorSession);
        if (!spectatorGeneral || !spectatorSession) {
          await editMessageRelay(errorMessages.unexpected, false);
          await resetNewInstances();
          throw Error('One of the spectator channels was not created.');
        }
      }
      const text = await messageMasterShield(newTable);
      const newMessage = await shield.send({ content: text });
      if (!newMessage) {
        await editMessageRelay(errorMessages.unexpected, false);
        await resetNewInstances();
        throw Error('Master shield message was not sent.');
      }
      newTable.shieldMessageId = newMessage.id;
      await newMessage.pin();
      // EXIT POINT.
      await syncToDatabase();
    };
    const createRoles = async () => {
      const loadingEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadingEmoji} ${createTableMessages.creatingTable}`;
      await editMessageRelay(details, false);
      const guild = await discordUtils.getGuild(newTable.serverId);
      if (!guild) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Guild was not found.');
      }
      const master = await discordUtils.getMember(newTable.masterId, guild);
      if (!master) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Table master was not found.');
      }
      let serverKey = '';
      const checkServers = Object.entries(servers).map(([key, value]) => {
        if (newTable.serverId === value) {
          serverKey = key;
        }
        return serverKey;
      });
      await Promise.all(checkServers);
      const role = await discordUtils.createRole(
        guild,
        `${newTable.emoji} • ${newTable.name}`,
        'BLUE',
        config.newRolePosition[
          serverKey as keyof typeof config.newRolePosition
        ],
        `Role da mesa: ${newTable.name}`,
        BigInt(0)
      );
      const spectatorRole = await discordUtils.createRole(
        guild,
        `Espectador • ${newTable.emoji} • ${newTable.name}`,
        'NOT_QUITE_BLACK',
        config.newRolePosition[
          serverKey as keyof typeof config.newRolePosition
        ],
        `Role espectador da mesa: ${newTable.name}`,
        BigInt(0)
      );
      newInstances.push(role);
      newInstances.push(spectatorRole);
      if (!role || !spectatorRole) {
        await editMessageRelay(errorMessages.unexpected, false);
        await resetNewInstances();
        throw Error('Main roles were not created.');
      }
      newTable.roleId = role.id;
      newTable.spectatorRoleId = spectatorRole.id;
      await master.roles.add(role);
      const checkRoles = await discordUtils.setGlobalRoles(master.user.id, [
        roles.master,
        roles.dj
      ]);
      if (!checkRoles) {
        await editMessageRelay(errorMessages.unexpected, false);
        await resetNewInstances();
        throw Error('Global roles were not set.');
      }
      // EXIT POINT.
      await createChannels(guild);
    };
    const confirmCreation = async () => {
      await editMessageRelay(
        createTableMessages.confirmCreation,
        confirmButtonsRow
      );
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on('end', async (collected) => {
        const interaction = collected.first();
        if (!interaction) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (interaction.customId === buttonIds.confirmNo) {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        if (interaction.customId === buttonIds.confirmYes) {
          const checkRolesSpace = discordUtils.checkServerMaxRoles(
            reply.guild!,
            config.newTableRoles
          );
          if (!checkRolesSpace) {
            await editMessageRelay(createTableMessages.maxRoles, false);
            return;
          }
          const checkChannelsSpace = newTable.spectatorAllowed
            ? discordUtils.checkServerMaxChannels(
                reply.guild!,
                config.specTableSize
              )
            : discordUtils.checkServerMaxChannels(
                reply.guild!,
                config.noSpecTableSize
              );
          if (!checkChannelsSpace) {
            await editMessageRelay(createTableMessages.maxChannels, false);
            return;
          }
          // EXIT POINT.
          await createRoles();
          return;
        }
        await editMessageRelay(createTableMessages.canceled, false);
      });
    };
    const getTableSpectator = async () => {
      await editMessageRelay(
        createTableMessages.allowSpectators,
        selectButtonsRow
      );
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on('end', async (collected) => {
        const interaction = collected.first();
        if (!interaction) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (interaction.customId === buttonIds.cancel) {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        newTable.spectatorAllowed =
          interaction.customId === buttonIds.confirmYes;
        // EXIT POINT.
        await confirmCreation();
      });
    };
    const getTableEmoji = async () => {
      await editMessageRelay(createTableMessages.typeEmoji, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (collMessage) => {
        const filteredEmoji = collMessage.content.trim().match(emojiRegex());
        if (!filteredEmoji?.length) {
          const details = `${createTableMessages.typeEmoji}\n*${createTableMessages.defaultEmojis}*`;
          await editMessageRelay(details);
          collMessage.delete();
          return;
        }
        const emoji = filteredEmoji[0];
        newTable.emoji = emoji;
        collInteractions.stop();
        collMessage.delete();
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && newTable.emoji === '') {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (newTable.emoji === '') {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getTableSpectator();
      });
    };
    const getTableName = async () => {
      await editMessageRelay(createTableMessages.typeName, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (collMessage) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(collMessage.content)) {
          const details = `${createTableMessages.typeName}\n*${createTableMessages.numbersAndLetters}*`;
          await editMessageRelay(details);
          collMessage.delete();
          return;
        }
        const tableExists = await mongodbUtils.getTableByName(
          collMessage.content
        );
        if (tableExists) {
          const details = `${createTableMessages.typeName}\n*${createTableMessages.alreadyExists}*`;
          await editMessageRelay(details);
          collMessage.delete();
          return;
        }
        newTable.name = collMessage.content.toLowerCase();
        collInteractions.stop();
        collMessage.delete();
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && newTable.name === '') {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (newTable.name === '') {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getTableEmoji();
      });
    };
    const getTableMaster = async () => {
      await editMessageRelay(
        createTableMessages.mentionMaster,
        cancelButtonRow
      );
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (collMessage) => {
        const guild = await discordUtils.getGuild(newTable.serverId);
        if (!guild) {
          await editMessageRelay(errorMessages.unexpected, false);
          collMessage.delete();
          throw Error('Guild was not found.');
        }
        const member = await discordUtils.getMember(
          collMessage.mentions.users.first()?.id || collMessage.content,
          guild
        );
        if (!member) {
          const details = `${createTableMessages.mentionMaster}\n***${collMessage.content}** não é um membro da **${guild}***.`;
          await editMessageRelay(details);
          collMessage.delete();
          return;
        }
        const isMaster = await discordUtils.hasRoleGlobal(
          member.user.id,
          roles.master
        );
        if (!isMaster) {
          const details = `${createTableMessages.mentionMaster}\n***${member}** não é um mestre em nenhum servidor.*`;
          await editMessageRelay(details);
          collMessage.delete();
          return;
        }
        newTable.masterId = member.id;
        collInteractions.stop();
        collMessage.delete();
      });
      collInteractions.on('end', async (collect) => {
        collMessages.stop();
        if (collect.size <= 0 && newTable.masterId === '') {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (newTable.masterId === '') {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getTableName();
      });
    };
    const getServer = async () => {
      await editMessageRelay(
        createTableMessages.selectServer,
        await selectServerRow()
      );
      const collInteractions = collectorSelectMenu(user, reply);
      collInteractions.on('collect', async (interaction) => {
        const value = interaction.values[0];
        if (value === selectMenuIds.cancel) {
          await editMessageRelay(createTableMessages.canceled, false);
          return;
        }
        const guild = await discordUtils.getGuild(value);
        if (!guild) {
          await editMessageRelay(errorMessages.unexpected, false);
          throw Error('Selected guild was not found.');
        }
        newTable.serverId = guild.id;
        // EXIT POINT.
        await getTableMaster();
      });
      collInteractions.on('end', async (collected) => {
        if (collected.size <= 0) {
          await editMessageRelay(generalMessages.inactivity, false);
        }
      });
    };

    await getServer();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'criar',
  aliases: ['create'],
  description: 'Cria uma mesa para um mestre.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.sectorAdministration,
  guildOnly: true,
  execute
};

export { command };
