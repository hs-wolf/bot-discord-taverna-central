import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';
import { GuildMember } from 'discord.js';

const messageListPlayers = async (
  details: string,
  table: Table,
  players: GuildMember[]
) => {
  try {
    if (!table) {
      return `**🍺 LISTA DE JOGADORES**\n\n${details}`;
    }
    const guild = await discordUtils.getGuild(table.serverId);
    const guildLabel = guild ? `\nServidor: **${guild}**` : '';
    const master =
      table.masterId && guild
        ? `\nMestre: **${await discordUtils.getMember(table.masterId, guild)}**`
        : '';
    const name = table.name ? `\nNome: **${table.emoji} ${table.name}**` : '';
    const spectators = `\nEspectadores: ${
      table.spectatorAllowed ? '**Sim**' : '**Não**'
    }`;
    const playersLabel = players.length
      ? `Jogadores: **${players.join(' ')}**`
      : '';
    return `**🍺 LISTA DE JOGADORES**${guildLabel}${master}${name}${spectators}\n\n${playersLabel}\n\n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 LISTA DE JOGADORES**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageListPlayers };
