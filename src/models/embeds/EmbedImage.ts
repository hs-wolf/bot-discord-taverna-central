import { MessageEmbed } from 'discord.js';

const EmbedImage = (url: string) => {
  const embed = new MessageEmbed();
  embed.setColor(0xffff00);
  embed.setImage(url);
  return embed;
};

export { EmbedImage };
