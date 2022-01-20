import { GuildMember } from 'discord.js';
import { identifiers } from '@components/identifiers';
import { discordUtils } from '@services/utilities/discord-utils';
import { logErrors } from '@services/utilities/log-errors';

const { roles } = identifiers;

const execute = async (member: GuildMember) => {
  try {
    await discordUtils.setGlobalRoles(member.id, [
      roles.separators.ranks,
      roles.separators.profile,
      roles.separators.notifications,
      roles.separators.tables,
      roles.ranks.squire
    ]);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

const event: Event = {
  name: 'guildMemberAdd',
  description: 'Event called when a user joins a server.',
  once: false,
  execute
};

export { event };
