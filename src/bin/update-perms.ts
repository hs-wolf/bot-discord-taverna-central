// /* eslint-disable no-continue */
// /* eslint-disable no-console */
// /* eslint-disable no-promise-executor-return */
// /* eslint-disable no-await-in-loop */
// import {
//   CategoryChannel,
//   Message,
//   OverwriteResolvable,
//   TextChannel
// } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { logErrors } from '@services/utilities/log-errors';
// import { mongodbUtils } from '@services/utilities/mongodb-utils';
// import { ITableSchema } from '@models/Schemas/TableSchema';
// import { discordUtils } from '@services/utilities/discord-utils';
// import { messageMasterShield } from '@models/messages/MessageMasterShield';
// import {
//   allPermissions,
//   categoryPlayerPermissions
// } from '@components/permissions';

// const { config, roles } = identifiers;

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
//         if (!category) {
//           return;
//         }
//         const master = await discordUtils.getMember(
//           allTables[i].masterId,
//           guild
//         );
//         if (!master) {
//           console.log(`Mesa: ${category.name} | Mestre não presente.`);
//           continue;
//         }
//         const channels = [...category.children.values()];
//         if (!channels) {
//           return;
//         }
//         const contributor = (await discordUtils.getRoles(
//           guild,
//           Object.values(roles.contributors)
//         ))![0];
//         if (!contributor) {
//           return;
//         }
//         const masterShieldOverwrites: OverwriteResolvable[] = [
//           {
//             id: guild.id,
//             deny: allPermissions
//           },
//           {
//             id: allTables[i].masterId,
//             allow: categoryPlayerPermissions
//           },
//           {
//             id: contributor.id,
//             allow: categoryPlayerPermissions
//           }
//         ];
//         console.log(`Mesa: ${category.name} | Canais: ${channels.length}`);
//         for (let j = 0; j < channels.length; j += 1) {
//           await timer(100);
//           if (channels[j] instanceof TextChannel) {
//             const currentChannel = channels[j] as TextChannel;
//             if (currentChannel.name.includes('escudo-mestre')) {
//               currentChannel.permissionOverwrites.set(masterShieldOverwrites);
//               const messageList = [
//                 ...(
//                   await (channels[j] as TextChannel).messages.fetch({
//                     limit: 100
//                   })
//                 ).values()
//               ];
//               const botMessages = messageList.filter((msg) => {
//                 return msg.author.id === config.botId && msg.pinned;
//               });
//               if (botMessages.length) {
//                 console.log(`Edited shield message.`);
//                 const text = await messageMasterShield(allTables[i]);
//                 await botMessages[0].edit({ content: text });
//               }
//             }
//           }
//         }
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
//   name: 'update-perms2',
//   aliases: ['update-perms2'],
//   description: 'Comando que atualiza as permissões.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   guildOnly: true,
//   execute
// };

// export { command };
