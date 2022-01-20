import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const messageCreateTable = async (details: string, table: Table) => {
  try {
    if (!table) {
      return `**🍺 CRIANDO MESA**\n\n${details}`;
    }
    const guild = await discordUtils.getGuild(table.serverId);
    const guildLabel = guild ? `\nServidor: **${guild}**` : '';
    const master =
      table.masterId && guild
        ? `\nMestre: **${await discordUtils.getMember(table.masterId, guild)}**`
        : '';
    const name = table.name ? `\nNome: **${table.name}**` : '';
    const emoji = table.emoji ? `\nEmoji: **${table.emoji}**` : '';
    let spectators = '';
    if (table.emoji) {
      spectators = `\nEspectadores: ${
        table.spectatorAllowed ? '**Sim**' : '**Não**'
      }`;
    }
    return `**🍺 CRIANDO MESA**${guildLabel}${master}${name}${emoji}${spectators}\n\n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 CRIANDO MESA**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageCreateTable };
