import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const messageNewChannel = async (details: string, table: Table) => {
  try {
    if (!table) {
      return `**🍺 NOVO CANAL**\n\n${details}`;
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
    return `**🍺 NOVO CANAL**${guildLabel}${master}${name}${spectators}\n\n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 NOVO CANAL**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageNewChannel };
