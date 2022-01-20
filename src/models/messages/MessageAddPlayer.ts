import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const messageAddPlayer = async (details: string, table: Table) => {
  try {
    if (!table) {
      return `**🍺 ADICIONANDO JOGADOR**\n\n${details}`;
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
    return `**🍺 ADICIONANDO JOGADOR**${guildLabel}${master}${name}${spectators}\n\n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 ADICIONANDO JOGADOR**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageAddPlayer };
