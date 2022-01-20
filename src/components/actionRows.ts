import {
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  MessageSelectOptionData
} from 'discord.js';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { discordUtils } from '@services/utilities/discord-utils';

const { config, servers, buttonIds, selectMenuIds, ageIds } = identifiers;
const { generalMessages, buttonLabels, selectMenuLabels, ageRatings } =
  messages;

const cancelButtonRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(buttonIds.cancel)
    .setLabel(buttonLabels.cancel)
    .setStyle('SECONDARY')
);
const selectButtonsRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(buttonIds.confirmYes)
    .setLabel(buttonLabels.yes)
    .setStyle('SUCCESS'),
  new MessageButton()
    .setCustomId(buttonIds.confirmNo)
    .setLabel(buttonLabels.no)
    .setStyle('PRIMARY'),
  new MessageButton()
    .setCustomId(buttonIds.cancel)
    .setLabel(buttonLabels.cancel)
    .setStyle('SECONDARY')
);
const confirmButtonsRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(buttonIds.confirmYes)
    .setLabel(buttonLabels.yes)
    .setStyle('SUCCESS'),
  new MessageButton()
    .setCustomId(buttonIds.confirmNo)
    .setLabel(buttonLabels.no)
    .setStyle('DANGER')
);
const rpgTypeButtonsRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(buttonIds.chooseCampaign)
    .setLabel(buttonLabels.campaign)
    .setStyle('PRIMARY'),
  new MessageButton()
    .setCustomId(buttonIds.chooseOneShot)
    .setLabel(buttonLabels.oneShot)
    .setStyle('PRIMARY'),
  new MessageButton()
    .setCustomId(buttonIds.chooseBeginner)
    .setLabel(buttonLabels.beginner)
    .setStyle('PRIMARY'),
  new MessageButton()
    .setCustomId(buttonIds.cancel)
    .setLabel(buttonLabels.cancel)
    .setStyle('SECONDARY')
);
const imageButtonRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(buttonIds.cancel)
    .setLabel(buttonLabels.cancel)
    .setStyle('SECONDARY'),
  new MessageButton()
    .setCustomId(buttonIds.defaultImage)
    .setLabel(buttonLabels.defaultImage)
    .setStyle('SECONDARY')
);
const selectServerRow = async () => {
  const currentGuilds: MessageSelectOptionData[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const key of Object.keys(servers)) {
    const guild = await discordUtils.getGuild(key);
    if (guild) {
      const option: MessageSelectOptionData = {
        label: `Taverna ${key.charAt(0).toUpperCase() + key.slice(1)}`,
        description: `Canais: ${guild.channels.cache.size}/${config.channelsLimit} - Cargos: ${guild.roles.cache.size}/${config.rolesLimit}`,
        value: key,
        emoji: '🍺'
      };
      currentGuilds.push(option);
    }
  }
  return new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(selectMenuIds.selectServer)
      .setPlaceholder(selectMenuLabels.selectServer)
      .addOptions([
        ...currentGuilds,
        {
          label: generalMessages.cancel,
          value: selectMenuIds.cancel,
          emoji: '❌'
        }
      ])
  );
};
const selectTableRow = (tables: Table[]) => {
  const getServer = (id: string) => {
    return Object.keys(servers).find(
      (key) => servers[key as keyof typeof servers] === id
    );
  };
  return new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(selectMenuIds.selectTable)
      .setPlaceholder(selectMenuLabels.selectTable)
      .addOptions([
        ...tables.map((table) => {
          const option: MessageSelectOptionData = {
            label: `${table.name}`,
            description: `Taverna ${
              getServer(table.serverId)!.charAt(0).toUpperCase() +
              getServer(table.serverId)!.slice(1)
            }`,
            value: table.name,
            emoji: table.emoji
          };
          return option;
        }),
        {
          label: generalMessages.cancel,
          value: selectMenuIds.cancel,
          emoji: '❌'
        }
      ])
  );
};
const selectAgeGroup = () => {
  return new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(selectMenuIds.selectAgeGroup)
      .setPlaceholder(selectMenuLabels.selectAgeGroup)
      .addOptions([
        ...Object.entries(ageIds).map(([key, value]) => {
          const option: MessageSelectOptionData = {
            label: `${ageRatings[key as keyof typeof ageRatings]}`,
            value
          };
          return option;
        }),
        {
          label: generalMessages.cancel,
          value: selectMenuIds.cancel,
          emoji: '❌'
        }
      ])
  );
};

export {
  cancelButtonRow,
  selectButtonsRow,
  confirmButtonsRow,
  rpgTypeButtonsRow,
  imageButtonRow,
  selectServerRow,
  selectTableRow,
  selectAgeGroup
};
