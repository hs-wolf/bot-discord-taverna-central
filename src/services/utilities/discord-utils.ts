import path from 'path';
import {
  Guild,
  PermissionResolvable,
  GuildChannel,
  GuildMember,
  Channel,
  GuildEmoji,
  ColorResolvable,
  Role,
  CategoryChannelResolvable,
  OverwriteResolvable,
  TextChannel,
  Message
} from 'discord.js';
import { identifiers } from '@components/identifiers';
import { client } from '@services/setup/connect-discord';
import { logErrors } from '@services/utilities/log-errors';

const { servers, config } = identifiers;

const getGuild = async (idOrKey: string) => {
  try {
    if (!Object.keys(servers).includes(idOrKey)) {
      return client.guilds.cache.get(idOrKey) as Guild | undefined;
    }
    return client.guilds.cache.get(servers[idOrKey as keyof typeof servers]) as
      | Guild
      | undefined;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getGuilds = async (idsOrKeys: string[]) => {
  try {
    const resolved = await Promise.all(
      idsOrKeys.map((id) => {
        if (!Object.keys(servers).includes(id)) {
          return client.guilds.cache.get(id) as Guild | undefined;
        }
        return client.guilds.cache.get(servers[id as keyof typeof servers]) as
          | Guild
          | undefined;
      })
    );
    return resolved.filter((guild) => guild !== undefined) as Guild[];
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getMember = async (id: string, guild: Guild) => {
  try {
    return guild.members.cache.get(id) as GuildMember;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getMembers = async (ids: string[], guild: Guild) => {
  try {
    const resolved = await Promise.all(
      ids.map((id) => guild.members.cache.get(id) as GuildMember)
    );
    return resolved.filter(
      (member: GuildMember) => member !== undefined
    ) as GuildMember[];
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getChannel = async (id: string) => {
  try {
    return client.channels.cache.get(id) as Channel;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getChannels = async (ids: string[]) => {
  try {
    const resolved = await Promise.all(
      ids.map((id) => client.channels.cache.get(id))
    );
    return resolved.filter((channel) => channel !== undefined) as Channel[];
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const hasRole = async (userId: string, roleId: string, guild: Guild) => {
  try {
    const member = await getMember(userId, guild);
    if (!member) {
      return false;
    }
    return member.roles.cache.has(roleId);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const hasRoles = async (userId: string, rolesIds: string[], guild: Guild) => {
  try {
    const member = await getMember(userId, guild);
    if (!member) {
      return false;
    }
    return rolesIds.every((id) => member.roles.cache.has(id));
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const hasRoleGlobal = async (
  userId: string,
  roleObject: Record<string, string>
) => {
  try {
    const serverPromises = await Promise.all(
      Object.values(servers).map(async (server) => {
        const guild = await getGuild(server);
        if (!guild) {
          return false;
        }
        const member = await getMember(userId, guild);
        if (!member) {
          return false;
        }
        const rolePromises = await Promise.all(
          Object.values(roleObject).map(async (id) => {
            return hasRole(userId, id, guild);
          })
        );
        return rolePromises.some((promise) => promise === true);
      })
    );
    return serverPromises.some((promise) => promise === true);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const hasRolesGlobal = async (
  userId: string,
  rolesObjects: Record<string, string>[]
) => {
  try {
    const keyPromises = await Promise.all(
      rolesObjects.map(async (object) => {
        const serverPromises = await Promise.all(
          Object.values(servers).map(async (server) => {
            const guild = await getGuild(server);
            if (!guild) {
              return false;
            }
            const member = await getMember(userId, guild);
            if (!member) {
              return false;
            }
            const rolePromises = await Promise.all(
              Object.values(object).map(async (id) => {
                return hasRole(userId, id, guild);
              })
            );
            return rolePromises.some((promise) => promise === true);
          })
        );
        return serverPromises.some((promise) => promise === true);
      })
    );
    return keyPromises.every((promise) => promise === true);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const hasPermissions = async (
  userId: string,
  perms: PermissionResolvable | PermissionResolvable[],
  channel?: GuildChannel
) => {
  try {
    if (channel) {
      const authorPerms = channel.permissionsFor(userId);
      if (!authorPerms) {
        return false;
      }
      return authorPerms.has(perms);
    }
    const resolved = await Promise.all(
      Object.values(servers).map(async (id) => {
        const guild = await getGuild(id);
        if (!guild) {
          return false;
        }
        const member = await getMember(userId, guild);
        if (!member) {
          return false;
        }
        return member.permissions.has(perms);
      })
    );
    return resolved.some((promise) => promise === true);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const getEmoji = async (key: string) => {
  try {
    return client.emojis.cache.find(
      (emoji) => emoji.name === key
    ) as GuildEmoji;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getEmojis = async (keys: string[]) => {
  try {
    const resolved = await Promise.all(
      keys.map((key) => client.emojis.cache.find((emoji) => emoji.name === key))
    );
    return resolved.filter((emoji) => emoji !== undefined) as GuildEmoji[];
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const createRole = async (
  guild: Guild,
  name: string,
  color: ColorResolvable,
  position: number,
  reason: string,
  permissions?: PermissionResolvable
) => {
  try {
    return await guild.roles.create({
      name,
      color,
      position,
      reason,
      permissions
    });
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const setGlobalRole = async (
  userId: string,
  roleObject: Record<string, string>
) => {
  try {
    const checkServers = await Promise.all(
      Object.values(servers).map(async (server) => {
        const guild = await getGuild(server);
        if (!guild) {
          return false;
        }
        const member = await getMember(userId, guild);
        if (!member) {
          return false;
        }
        const role = guild.roles.cache.get(
          roleObject[server as keyof typeof roleObject]
        );
        if (!role) {
          return false;
        }
        await member.roles.add(role);
        if (!member.roles.cache.hasAll(role.id)) {
          return false;
        }
        return true;
      })
    );
    return checkServers.some(
      (promise: boolean | undefined) => promise === true
    );
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const setGlobalRoles = async (
  userId: string,
  rolesObjects: Record<string, string>[]
) => {
  try {
    const checkServers = await Promise.all(
      Object.values(servers).map(async (server) => {
        const checkObject = await Promise.all(
          rolesObjects.map(async (roleObject) => {
            const guild = await getGuild(server);
            if (!guild) {
              return false;
            }
            const member = await getMember(userId, guild);
            if (!member) {
              return false;
            }
            const checkRoles = await Promise.all(
              Object.values(roleObject).map(async (id) => {
                const role = guild.roles.cache.get(id);
                if (!role) {
                  return false;
                }
                await member.roles.add(role);
                return true;
              })
            );
            return checkRoles.some((promise: boolean) => promise === true);
          })
        );
        return checkObject.every((promise: boolean) => promise === true);
      })
    );
    return checkServers.some((promise: boolean) => promise === true);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const getRole = async (guild: Guild, id: string) => {
  try {
    return guild.roles.cache.get(id) as Role;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getRoles = async (guild: Guild, ids: string[]) => {
  try {
    const resolved = await Promise.all(
      ids.map((id) => guild.roles.cache.get(id) as Role)
    );
    return resolved.filter((role) => role !== undefined) as Role[];
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const getMessage = async (channel: TextChannel, id: string) => {
  try {
    return channel.messages.fetch(id);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const createChannel = async (
  guild: Guild,
  name: string,
  type: number,
  parent?: CategoryChannelResolvable | undefined,
  permissionOverwrites?: OverwriteResolvable[]
) => {
  try {
    return (await guild.channels.create(name, {
      type,
      parent,
      permissionOverwrites
    })) as GuildChannel;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return undefined;
  }
};

const checkServerMaxChannels = (guild: Guild, number: number) => {
  try {
    if (!guild) {
      return false;
    }
    if (guild.channels.cache.size + number > config.channelsLimit) {
      return false;
    }
    return true;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

const checkServerMaxRoles = (guild: Guild, number: number) => {
  try {
    if (!guild) {
      return false;
    }
    if (guild.roles.cache.size + number > config.rolesLimit) {
      return false;
    }
    return true;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return false;
  }
};

type DiscordUtils = Service & {
  getGuild: (idsOrKeys: string) => Promise<Guild | undefined>;
  getGuilds: (idsOrKeys: string[]) => Promise<Guild[] | undefined>;
  getMember: (id: string, guild: Guild) => Promise<GuildMember | undefined>;
  getMembers: (
    ids: string[],
    guild: Guild
  ) => Promise<GuildMember[] | undefined>;
  getChannel: (id: string) => Promise<Channel | undefined>;
  getChannels: (ids: string[]) => Promise<Channel[] | undefined>;
  hasRole: (
    userId: string,
    roleId: string,
    guild: Guild
  ) => Promise<boolean | undefined>;
  hasRoles: (
    userId: string,
    rolesIds: string[],
    guild: Guild
  ) => Promise<boolean | undefined>;
  hasRoleGlobal: (
    userId: string,
    roleObject: Record<string, string>
  ) => Promise<boolean | undefined>;
  hasRolesGlobal: (
    userId: string,
    rolesObjects: Record<string, string>[]
  ) => Promise<boolean | undefined>;
  hasPermissions: (
    userId: string,
    perms: PermissionResolvable | PermissionResolvable[],
    channel?: GuildChannel
  ) => Promise<boolean>;
  getEmoji: (key: string) => Promise<GuildEmoji | undefined>;
  getEmojis: (keys: string[]) => Promise<GuildEmoji[] | undefined>;
  createRole: (
    guild: Guild,
    name: string,
    color: ColorResolvable,
    position: number,
    reason: string,
    permissions?: PermissionResolvable
  ) => Promise<Role | undefined>;
  setGlobalRole: (
    userId: string,
    roleObject: Record<string, string>
  ) => Promise<boolean>;
  setGlobalRoles: (
    userId: string,
    rolesObjects: Record<string, string>[]
  ) => Promise<boolean>;
  getRole: (guild: Guild, id: string) => Promise<Role | undefined>;
  getRoles: (guild: Guild, ids: string[]) => Promise<Role[] | undefined>;
  getMessage: (
    channel: TextChannel,
    id: string
  ) => Promise<Message | undefined>;
  createChannel: (
    guild: Guild,
    name: string,
    type: number,
    parent?: CategoryChannelResolvable | undefined,
    permissionOverwrites?: OverwriteResolvable[]
  ) => Promise<GuildChannel | undefined>;
  checkServerMaxChannels: (guild: Guild, number: number) => boolean;
  checkServerMaxRoles: (guild: Guild, number: number) => boolean;
};
const discordUtils: DiscordUtils = {
  name: path.basename(__filename, path.extname(__filename)),
  description:
    'Service that connects the Discord API to the app with easy getters and setters.',
  getGuild,
  getGuilds,
  getMember,
  getMembers,
  getChannel,
  getChannels,
  hasRole,
  hasRoles,
  hasRoleGlobal,
  hasRolesGlobal,
  hasPermissions,
  getEmoji,
  getEmojis,
  createRole,
  setGlobalRole,
  setGlobalRoles,
  getRole,
  getRoles,
  getMessage,
  createChannel,
  checkServerMaxChannels,
  checkServerMaxRoles
};

export { discordUtils };
