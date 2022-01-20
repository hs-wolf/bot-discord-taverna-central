// /* eslint-disable no-console */
// /* eslint-disable no-promise-executor-return */
// /* eslint-disable no-await-in-loop */
// import { Message } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { logErrors } from '@services/utilities/log-errors';
// import { mongodbUtils } from '@services/utilities/mongodb-utils';
// import { ITableSchema } from '@models/Schemas/TableSchema';
// import { discordUtils } from '@services/utilities/discord-utils';

// const { roles } = identifiers;

// const execute = async (message: Message) => {
//   try {
//     const reply = await message.reply({
//       content: `${message.author}`
//     });

//     const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

//     const load = async (allTables: ITableSchema[]) => {
//       for (let i = 0; i < allTables.length; i += 1) {
//         await timer(1000);
//         const guild = await discordUtils.getGuild(allTables[i].serverId);
//         if (!guild) {
//           return;
//         }
//         const mainRole = await discordUtils.getRole(guild, allTables[i].roleId);
//         const specRole = await discordUtils.getRole(
//           guild,
//           allTables[i].spectatorRoleId
//         );
//         console.log(
//           `Mesa: ${allTables[i].name}\nRole: ${mainRole?.name}\nSpec: ${specRole?.name}\n\n`
//         );
//       }
//       await reply.edit({
//         content: `${message.author} ✅ Database atualizada com sucesso.`
//       });
//     };

//     const getTables = async () => {
//       const allTables = await mongodbUtils.getAllTables();
//       if (!allTables) {
//         return;
//       }
//       console.log(`Tables Found: ${allTables.length}`);
//       await load(allTables);
//     };

//     await getTables();
//   } catch (e: any) {
//     logErrors.newLog({ filePath: __filename, err: e });
//   }
// };

// const command: Command = {
//   name: 'check-roles',
//   aliases: ['check-roles'],
//   description: 'Comando que checa todas as roles.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   guildOnly: true,
//   execute
// };

// export { command };
