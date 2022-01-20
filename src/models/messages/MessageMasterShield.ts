import { identifiers } from '@components/identifiers';
import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const { config, customEmojis } = identifiers;

const messageMasterShield = async (table: Table) => {
  try {
    const emoji1 = await discordUtils.getEmoji(customEmojis.one);
    const emoji2 = await discordUtils.getEmoji(customEmojis.two);
    const emoji3 = await discordUtils.getEmoji(customEmojis.three);
    const emoji4 = await discordUtils.getEmoji(customEmojis.four);
    const emoji5 = await discordUtils.getEmoji(customEmojis.five);
    const emoji6 = await discordUtils.getEmoji(customEmojis.six);
    const emoji7 = await discordUtils.getEmoji(customEmojis.seven);
    return `\n${emoji1} Nome da mesa: \`${
      table.name ? table.name : 'Erro ao checar nome da mesa.'
    }\`
  \n${emoji1} Anúnciar sua campanha/one-shot: \`${config.defaultPrefix}rpg\`
  \n${emoji2} Adicionar jogadores: \`${config.defaultPrefix}add\`
  \n${emoji3} Remover jogadores: \`${config.defaultPrefix}remove\`
  \n${emoji4} Listar jogadores da mesa: \`${config.defaultPrefix}ls\`
  \n${emoji5} Criar novo canal de texto/áudio: \`${config.defaultPrefix}novo\`
  \n${emoji6} Para ver a lista de comandos completa: \`${
      config.defaultPrefix
    }comandos\`
  \n${emoji7} *(Indisponível)* Alguma dúvida rápida? \`${
      config.defaultPrefix
    }help\``;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return `Erro inesperado ao gerar mensagem.`;
  }
};

export { messageMasterShield };
