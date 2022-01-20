import { discordUtils } from '@services/utilities/discord-utils';
import { identifiers } from '@components/identifiers';
import { messages } from '@components/messages';
import { logErrors } from '@services/utilities/log-errors';

const { customEmojis, ageIds } = identifiers;
const { ageRatings } = messages;

const messageNewRpg = async (details: string, table: Table, rpg: Rpg) => {
  try {
    if (!table) {
      return `**🍺 CRIANDO RPG**\n\n${details}`;
    }
    const name = table.name ? `\nMesa: **${table.emoji} ${table.name}**` : '';
    const guild = await discordUtils.getGuild(table.serverId);
    const guildLabel = guild ? `\nServidor: **${guild}**` : '';
    const spectators = `\nEspectadores: ${
      table.spectatorAllowed ? '**Sim**' : '**Não**'
    }`;
    if (!rpg) {
      return `**🍺 CRIANDO RPG**${name}${guildLabel}${spectators}\n\n${details}`;
    }
    const title = rpg.title ? `\nTítulo: **${rpg.title}**` : '';
    let type = rpg.type >= 0 ? '\nTipo: **Indefinido**' : '';
    switch (rpg.type) {
      case 0:
        type = rpg.type ? '\nTipo: **Campanha**' : '';
        break;
      case 1:
        type = rpg.type ? '\nTipo: **One-Shot**' : '';
        break;
      case 2:
        type = rpg.type ? '\nTipo: **Iniciante**' : '';
        break;
      default:
    }
    const idKey = `${Object.keys(ageIds).find(
      (key) => ageIds[key as keyof typeof ageIds] === rpg.age
    )}`;
    const emojiAge = await discordUtils.getEmoji(
      customEmojis[idKey as keyof typeof customEmojis]
    );
    const age = rpg.age
      ? `\nLimite Idade: **${emojiAge} ${
          ageRatings[idKey as keyof typeof ageRatings]
        }**`
      : '';
    const system = rpg.system ? `\nSistema: **${rpg.system}**` : '';
    const style = rpg.style ? `\nEstilo: **${rpg.style}**` : '';
    const date = rpg.date ? `\nData: **${rpg.date}**` : '';
    const slots = rpg.slots ? `\nVagas: **${rpg.slots}**` : '';
    const briefing = rpg.briefing ? `\nResumo: **${rpg.briefing}**` : '';
    const rules = rpg.rules ? `\nRegras: **${rpg.rules}**` : '';
    const imageLink = rpg.imageLink ? `\nImagem: **${rpg.imageLink}**` : '';

    return `**🍺 CRIANDO RPG**${name}${guildLabel}${spectators}
    ${title}${type}${age}${system}${style}${date}${slots}${briefing}${rules}${imageLink}
    \n${details}`;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `**🍺 CRIANDO RPG**\n\nErro inesperado ao gerar mensagem.`;
  }
};

export { messageNewRpg };
