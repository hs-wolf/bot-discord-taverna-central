import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const messageDeleteTable = async (details: string, table: Table) => {
  try {
    if (!table) {
      return `**🍺 DELETANDO MESA**\n\n${details}`;
    }
    const guild = await discordUtils.getGuild(table.serverId);
    const guildLabel = guild ? `\nServidor: **${guild}**` : '';
    const master =
      guild && table.masterId
        ? `\nMestre: **${await discordUtils.getMember(table.masterId, guild)}**`
        : '';
    const name = table.name ? `\nNome: **${table.emoji} ${table.name}**` : '';
    let spectators = '';
    if (table.emoji) {
      spectators = `\nEspectadores: ${
        table.spectatorAllowed ? '**Sim**' : '**Não**'
      }`;
    }
    const data = `${name}${master}${guildLabel}${spectators}`;
    return `**🍺 DELETANDO MESA**${data}${
      data ? `\n\n${details}` : `\n${details}`
    }`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 DELETANDO MESA**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageDeleteTable };
