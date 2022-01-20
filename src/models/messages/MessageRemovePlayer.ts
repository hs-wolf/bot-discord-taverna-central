import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const messageRemovePlayer = async (details: string, table: Table) => {
  try {
    if (!table) {
      return `**🍺 REMOVENDO JOGADORES**\n\n${details}`;
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
    return `**🍺 REMOVENDO JOGADORES**${guildLabel}${master}${name}${spectators}\n\n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 REMOVENDO JOGADOR**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageRemovePlayer };
