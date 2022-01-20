import path from 'path';
import { Message } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { commandsList } from '@services/setup/fetch-commands';
import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const { config } = identifiers;
const spamCooldowns = new Map();

const validate = async (message: Message, prefix: string) => {
  try {
    const now = Date.now();
    const currentSpam = config.spamCooldown;
    if (spamCooldowns.has(message.author.id)) {
      const protectionTime =
        spamCooldowns.get(message.author.id) + config.spamCooldown;
      if (now < protectionTime) {
        return {
          done: false,
          protected: true
        };
      }
    }
    spamCooldowns.set(message.author.id, now);
    setTimeout(() => spamCooldowns.delete(message.author.id), currentSpam);
    const args = message.content
      .slice(prefix?.length)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/ +/);
    const commandName = args.shift()?.toLowerCase() as string;

    const command = commandsList.find(
      (x) => x.name === commandName || x.aliases?.includes(commandName)
    );
    if (!command) {
      return {
        done: false,
        reason: `**\` ${prefix}${commandName} \`** não existe. Use **\` ${prefix}comandos \`** para ver a lista de comandos.`
      };
    }
    const currentCooldown =
      command.delay && command.delay > 0
        ? command.delay
        : config.defaultCooldown;
    if (command.cooldowns.has(message.author.id)) {
      const expirationTime =
        command.cooldowns.get(message.author.id)! + currentCooldown;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return {
          done: false,
          reason: `**\` ${prefix}${
            command.name
          } \`** está recarregando. Tente novamente em **${timeLeft.toFixed(
            0
          )} ${timeLeft >= 2 ? 'segundos' : 'segundo'}**.`
        };
      }
    }
    command.cooldowns.set(message.author.id, now);
    setTimeout(
      () => command.cooldowns.delete(message.author.id),
      currentCooldown
    );
    if (command.permissions) {
      const authorPerms = await discordUtils.hasPermissions(
        message.author.id,
        command.permissions
      );
      if (!authorPerms) {
        return {
          done: false,
          reason: `Você não tem permissão para usar **\` ${prefix}${command.name} \`**`
        };
      }
    }
    if (command.channelsBlocked) {
      const checkChannels = Array.isArray(command.channelsBlocked)
        ? command.channelsBlocked.includes(message.channel.id)
        : command.channelsBlocked === message.channel.id;
      if (checkChannels) {
        return {
          done: false,
          reason: `Não é possível usar **\` ${prefix}${command.name} \`** neste canal.`
        };
      }
    }
    if (command.roles) {
      const checkRoles = Array.isArray(command.roles)
        ? await discordUtils.hasRolesGlobal(message.author.id, command.roles)
        : await discordUtils.hasRoleGlobal(message.author.id, command.roles);
      if (!checkRoles) {
        return {
          done: false,
          reason: `Você não tem ${
            Array.isArray(command.roles) ? 'os cargos' : 'o cargo'
          } para usar **\` ${prefix}${command.name} \`**`
        };
      }
    }
    if (command.guildOnly && message.channel.type === 'DM') {
      return {
        done: false,
        reason: `**\` ${prefix}${command.name} \`** não pode ser usado em DMs.`
      };
    }
    if (command.args && args.length < command.args) {
      let description = `**\` ${prefix}${command.name} \`** está incompleto.`;
      if (command.usage) {
        description += ` Tente: **\` ${prefix}${command.name} ${command.usage} \`**`;
      }
      return {
        done: false,
        reason: description
      };
    }
    return {
      done: true,
      command,
      args
    };
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return {
      done: false,
      reason: `Ocorreu um erro inesperado. Tente novamente mais tarde.`
    };
  }
};

type ValidateCommand = Service & {
  validate(
    message: Message,
    prefix: string
  ): Promise<{
    done: boolean;
    protected?: boolean;
    reason?: string;
    command?: Command;
    args?: string[];
  }>;
};
const validateCommand: ValidateCommand = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Service that validades the command called by the user.',
  validate
};

export { validateCommand };
