import { Message } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { commandsList } from '@services/setup/fetch-commands';
import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const { config } = identifiers;

const execute = async (message: Message) => {
  try {
    const user = message.author;
    const reply = await message.reply({
      content: `${message.author} Este comando está em manutenção.`
    });
    let details = `**🍺 LISTA DE COMANDOS**`;
    const commandsFormated = await Promise.all(
      commandsList.map(async (command) => {
        if (command.roles) {
          const checkRoles = Array.isArray(command.roles)
            ? await discordUtils.hasRolesGlobal(user.id, command.roles)
            : await discordUtils.hasRoleGlobal(user.id, command.roles);
          if (!checkRoles) {
            return '';
          }
          let text = `\n\n**${config.defaultPrefix}${command.name}** ${command.description}`;
          if (command.usage) {
            text += `\nUso: **\` ${config.defaultPrefix}${command.name} ${command.usage} \`**`;
          }
          return text;
        }
        let text = `\n\n**${config.defaultPrefix}${command.name}** ${command.description}`;
        if (command.usage) {
          text += `\nUso: **\` ${config.defaultPrefix}${command.name} ${command.usage} \`**`;
        }
        return text;
      })
    );
    commandsFormated.forEach((command) => {
      details += command;
    });
    await reply.edit({ content: details });
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const command: Command = {
  name: 'comandos',
  aliases: ['cs', 'commands'],
  description: 'Lista todos os comandos disponíveis para você.',
  protections: new Map(),
  cooldowns: new Map(),
  execute
};

export { command };
