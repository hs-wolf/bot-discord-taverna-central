import { CategoryChannel, MessageEmbed } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { discordUtils } from '@services/utilities/discord-utils';

const { servers, invites, customEmojis, ageIds } = identifiers;
const { ageRatings } = messages;

const EmbedPublish = async (rpg: Rpg) => {
  const guild = await discordUtils.getGuild(servers.central);
  const serverLink = () => {
    const key = Object.keys(servers).find(
      (server) => servers[server as keyof typeof servers] === rpg.serverId
    );
    return invites[key as keyof typeof invites];
  };
  const master = await discordUtils.getMember(rpg.masterId!, guild!);
  const idKey = `${Object.keys(ageIds).find(
    (key) => ageIds[key as keyof typeof ageIds] === rpg.age
  )}`;
  const emojiAge = await discordUtils.getEmoji(
    customEmojis[idKey as keyof typeof customEmojis]
  );
  const table = await discordUtils.getChannel(rpg.categoryId!);
  const spectators = `Para espectar a mesa use: \`c!seguir ${
    (table as CategoryChannel).name
  }\``;
  let type = 'Indefinido';
  switch (rpg.type) {
    case 0:
      type = 'Campanha';
      break;
    case 1:
      type = 'One-Shot';
      break;
    case 2:
      type = 'Iniciante';
      break;
    default:
      type = 'Indefinido';
  }
  const embed = new MessageEmbed();
  embed.setColor(0xffff00);
  embed.setTitle(`${type} ・ ${rpg.title}`);
  embed.setDescription(`**Mestre: ${master}**\n\u200B`);
  embed.addFields(
    {
      name: `🖥 Servidor`,
      value: `[${guild}](${serverLink()})`,
      inline: true
    },
    {
      name: `${emojiAge} Limite Idade`,
      value: `${ageRatings[idKey as keyof typeof ageRatings]}`,
      inline: true
    },
    {
      name: `⚙ Sistema`,
      value: `${rpg.system}`,
      inline: true
    },

    {
      name: `✒ Estilo`,
      value: `${rpg.style}`,
      inline: true
    },
    {
      name: `👥 Vagas`,
      value: `${rpg.slots}`,
      inline: true
    },
    {
      name: `📅 Data`,
      value: `${rpg.date}`,
      inline: true
    },
    {
      name: `\u200B\n📖 Resumo`,
      value: `${rpg.briefing}`
    },
    {
      name: `\u200B\n📋 Regras`,
      value: `${rpg.rules}`
    },
    {
      name: `\u200B`,
      value: `${spectators}`
    }
  );
  return embed;
};

export { EmbedPublish };
