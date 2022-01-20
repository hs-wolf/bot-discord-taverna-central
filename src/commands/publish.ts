import {
  Collection,
  Message,
  MessageActionRow,
  SelectMenuInteraction,
  Channel,
  TextChannel,
  Role
} from 'discord.js';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { messageNewRpg } from '@models/messages/MessageNewRpg';
import { RpgSchema } from '@models/Schemas/RpgSchema';
import { EmbedPublish } from '@models/embeds/EmbedPublish';
import { EmbedImage } from '@models/embeds/EmbedImage';
import { editMessage } from '@services/utilities/edit-message';
import { logErrors } from '@services/utilities/log-errors';
import { mongodbUtils } from '@services/utilities/mongodb-utils';
import {
  cancelButtonRow,
  confirmButtonsRow,
  imageButtonRow,
  rpgTypeButtonsRow,
  selectAgeGroup,
  selectTableRow
} from '@components/actionRows';
import {
  collectorButtons,
  collectorMessage,
  collectorSelectMenu
} from '@components/collectors';
import { discordUtils } from '@services/utilities/discord-utils';

const {
  regex,
  config,
  servers,
  customEmojis,
  buttonIds,
  selectMenuIds,
  channels,
  roles
} = identifiers;
const { errorMessages, generalMessages, newRpgMessages } = messages;

const execute = async (message: Message) => {
  try {
    await message.reply({
      content: `${message.author} ${generalMessages.checkDms}`
    });
    const user = message.author;
    const reply = await user.send({
      content: `${message.author}`
    });
    let currentTable: Table;
    const newRpg: Rpg = {
      serverId: '',
      categoryId: '',
      masterId: '',
      replyId: '',
      type: -1,
      full: false,
      age: '',
      title: '',
      system: '',
      style: '',
      date: '',
      slots: '',
      briefing: '',
      rules: '',
      imageLink: ''
    };

    const editMessageRelay = async (
      details: string,
      actionRow?: MessageActionRow | false
    ) => {
      await editMessage.textAndActionRow(
        reply,
        await messageNewRpg(details, currentTable, newRpg),
        actionRow
      );
    };

    const publishRpg = async () => {
      const loadingEmoji = await discordUtils.getEmoji(customEmojis.loading);
      const details = `${loadingEmoji} ${newRpgMessages.publishing}`;
      await editMessageRelay(details);

      const guild = await discordUtils.getGuild(servers.central);
      if (!guild) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw new Error('Publication guild not found.');
      }

      let publicationChannel: Channel | undefined;
      let publicationRole: Role | undefined;
      switch (newRpg.type) {
        case 0:
          publicationChannel = await discordUtils.getChannel(
            channels.campaigns.central
          );
          publicationRole = await discordUtils.getRole(
            guild,
            roles.campaigns.central
          );
          break;
        case 1:
          publicationChannel = await discordUtils.getChannel(
            channels.oneShots.central
          );
          publicationRole = await discordUtils.getRole(
            guild,
            roles.oneShots.central
          );
          break;
        case 2:
          publicationChannel = await discordUtils.getChannel(
            channels.beginners.central
          );
          publicationRole = await discordUtils.getRole(
            guild,
            roles.beginners.central
          );
          break;
        default:
          await editMessageRelay(errorMessages.unexpected, false);
          throw new Error('Publication channel not found.');
      }

      if (!publicationChannel || !publicationRole) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw new Error('Publication channel or role not found.');
      }

      const publishReply = await (publicationChannel as TextChannel).send({
        content: `${publicationRole}`,
        embeds: [await EmbedPublish(newRpg), EmbedImage(newRpg.imageLink!)]
      });
      newRpg.replyId = publishReply.id;

      const newRpgDb = await new RpgSchema(newRpg).save();
      if (!newRpgDb) {
        await editMessageRelay(errorMessages.unexpected, false);
        throw Error('Could not save Rpg in the database.');
      }

      await editMessageRelay(newRpgMessages.success, false);
    };

    const confirmCreation = async () => {
      await editMessageRelay(newRpgMessages.confirm, confirmButtonsRow);
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on('end', async (collected) => {
        const interaction = collected.first();
        if (!interaction) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (interaction.customId === buttonIds.confirmYes) {
          // EXIT POINT
          await publishRpg();
          return;
        }
        await editMessageRelay(newRpgMessages.canceled, false);
      });
    };

    const getImage = async () => {
      await editMessageRelay(newRpgMessages.getImage, imageButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const imageUrl = msg.attachments.first()?.url;
        if (!imageUrl) {
          return;
        }
        newRpg.imageLink = imageUrl;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        const interaction = collected.first()!;
        if (!interaction && !newRpg.imageLink) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (interaction && interaction.customId === buttonIds.cancel) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        if (interaction && interaction.customId === buttonIds.defaultImage) {
          newRpg.imageLink = config.tableImageUrl;
        }
        // EXIT POINT.
        await confirmCreation();
      });
    };

    const getRules = async () => {
      await editMessageRelay(newRpgMessages.getRules, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getRules} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.rules = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.rules) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.rules) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getImage();
      });
    };

    const getBriefing = async () => {
      await editMessageRelay(newRpgMessages.getBriefing, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getBriefing} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.briefing = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.briefing) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.briefing) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getRules();
      });
    };

    const getSlots = async () => {
      await editMessageRelay(newRpgMessages.getSlots, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getSlots} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.slots = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.slots) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.slots) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getBriefing();
      });
    };

    const getDate = async () => {
      await editMessageRelay(newRpgMessages.getDate, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getDate} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.date = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.date) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.date) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getSlots();
      });
    };

    const getStyle = async () => {
      await editMessageRelay(newRpgMessages.getStyle, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getStyle} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.style = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.style) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.style) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getDate();
      });
    };

    const getSystem = async () => {
      await editMessageRelay(newRpgMessages.getSystem, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getSystem} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        newRpg.system = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.system) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.system) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getStyle();
      });
    };

    const getAge = async () => {
      await editMessageRelay(newRpgMessages.selectAge, selectAgeGroup());
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
            await editMessageRelay(newRpgMessages.canceled, false);
            return;
          }
          // eslint-disable-next-line prefer-destructuring
          newRpg.age = interaction.values[0];
          // EXIT POINT.
          await getSystem();
        }
      );
    };

    const getType = async () => {
      await editMessageRelay(newRpgMessages.selectType, rpgTypeButtonsRow);
      const collInteractions = collectorButtons(user, reply);
      collInteractions.on('end', async (collected) => {
        const interaction = collected.first();
        if (!interaction) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        switch (interaction.customId) {
          case buttonIds.chooseCampaign:
            newRpg.type = 0;
            break;
          case buttonIds.chooseOneShot:
            newRpg.type = 1;
            break;
          case buttonIds.chooseBeginner:
            newRpg.type = 2;
            break;
          default:
            await editMessageRelay(newRpgMessages.canceled, false);
            return;
        }
        // EXIT POINT.
        await getAge();
      });
    };

    const getTitle = async () => {
      await editMessageRelay(newRpgMessages.getTitle, cancelButtonRow);
      const collInteractions = collectorButtons(user, reply);
      const collMessages = collectorMessage(user, reply);
      collMessages.on('collect', async (msg) => {
        const regexFilter = new RegExp(regex.alphanumeric, 'gi');
        if (!regexFilter.test(msg.content)) {
          const details = `${newRpgMessages.getTitle} ${newRpgMessages.numberAndLetters}`;
          await editMessageRelay(details);
          return;
        }
        const rpgExists = await mongodbUtils.getRpgByTitle(msg.content);
        if (rpgExists) {
          const sameUser = rpgExists.masterId === user.id;
          if (sameUser) {
            const details = `${newRpgMessages.getTitle} ${newRpgMessages.alreadyExists}`;
            await editMessageRelay(details);
            return;
          }
        }
        newRpg.title = msg.content;
        collInteractions.stop();
        if (msg.guild) {
          msg.delete();
        }
      });
      collInteractions.on('end', async (collected) => {
        collMessages.stop();
        if (collected.size <= 0 && !newRpg.title) {
          await editMessageRelay(generalMessages.inactivity, false);
          return;
        }
        if (!newRpg.title) {
          await editMessageRelay(newRpgMessages.canceled, false);
          return;
        }
        // EXIT POINT.
        await getType();
      });
    };

    const checkTables = async () => {
      const tablesFromDb = await mongodbUtils.getTablesByMaster(user.id);
      if (!tablesFromDb || !tablesFromDb.length) {
        await editMessageRelay(newRpgMessages.noTable, false);
        return;
      }
      if (tablesFromDb.length === 1) {
        currentTable = Object.assign(
          JSON.parse(JSON.stringify(tablesFromDb[0]))
        );
        newRpg.serverId = currentTable.serverId;
        newRpg.categoryId = currentTable.categoryChannelId;
        newRpg.masterId = currentTable.masterId;
        // EXIT POINT.
        await getTitle();
        return;
      }
      await editMessageRelay(
        newRpgMessages.selectTable,
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
            await editMessageRelay(newRpgMessages.canceled, false);
            return;
          }
          const selectedTable = tablesFromDb.find(
            (table) => table.name === interaction.values[0]
          );
          currentTable = Object.assign(
            JSON.parse(JSON.stringify(selectedTable))
          );
          newRpg.serverId = currentTable.serverId;
          newRpg.categoryId = currentTable.categoryChannelId;
          newRpg.masterId = currentTable.masterId;
          // EXIT POINT.
          await getTitle();
        }
      );
    };

    await checkTables();
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'rpg',
  aliases: ['publicar', 'publish', 'oneshot', 'one-shot', 'campanha'],
  description: 'Publica um novo rpg para todos os jogadores verem.',
  protections: new Map(),
  cooldowns: new Map(),
  roles: roles.master,
  guildOnly: true,
  execute
};

export { command };
