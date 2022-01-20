declare type Command = {
  name: string;
  aliases?: string | string[];
  description: string;
  delay?: number;
  protections: Map<string, number>;
  cooldowns: Map<string, number>;
  permissions?:
    | import('discord.js').PermissionResolvable
    | import('discord.js').PermissionResolvable[];
  channelsBlocked?: string | string[];
  roles?: Record<string, string> | Record<string, string>[];
  guildOnly?: boolean;
  args?: number;
  usage?: string;
  execute: (
    message: import('discord.js').Message,
    argList?: string[]
  ) => Promise<void>;
};
