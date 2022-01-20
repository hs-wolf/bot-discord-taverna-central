// /* eslint-disable no-console */
// /* eslint-disable no-promise-executor-return */
// /* eslint-disable no-await-in-loop */
// import { CategoryChannel, GuildChannel, Message } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { logErrors } from '@services/utilities/log-errors';
// import { mongodbUtils } from '@services/utilities/mongodb-utils';
// import { ITableSchema, TableSchema } from '@models/Schemas/TableSchema';
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
//         const category = (await discordUtils.getChannel(
//           allTables[i].categoryChannelId
//         )) as CategoryChannel;
//         // let correctChannel: CategoryChannel | null = null;
//         // if (!(category instanceof CategoryChannel)) {
//         //   const checkParent = (category as GuildChannel).parent;
//         //   if (checkParent instanceof CategoryChannel) {
//         //     correctChannel = checkParent;
//         //   }
//         // }
//         // if (correctChannel) {
//         //   await TableSchema.updateOne(
//         //     {
//         //       roleId: allTables[i].roleId
//         //     },
//         //     {
//         //       categoryChannelId: correctChannel.id
//         //     }
//         //   ).exec();
//         // }
//         console.log(
//           `Mesa: ${allTables[i].name}\nCategory: ${category.name}\n\n`
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
//   name: 'check-category',
//   aliases: ['check-category'],
//   description: 'Comando que checa todas as roles.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   guildOnly: true,
//   execute
// };

// export { command };
