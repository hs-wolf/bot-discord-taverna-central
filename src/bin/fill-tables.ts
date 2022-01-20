// /* eslint-disable no-promise-executor-return */
// /* eslint-disable no-await-in-loop */
// import path from 'path';
// import {
//   CategoryChannel,
//   GuildChannel,
//   Message,
//   OverwriteResolvable,
//   TextChannel
// } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { discordUtils } from '@services/utilities/discord-utils';
// import { mongodbUtils } from '@services/utilities/mongodb-utils';
// import {
//   allPermissions,
//   categoryPlayerPermissions,
//   categorySpectatorPermissions,
//   channelsMasterPermissions
// } from '@components/permissions';
// import { TableSchema } from '@models/Schemas/TableSchema';
// import { messageMasterShield } from '@models/messages/MessageMasterShield';

// const { config, customEmojis, roles } = identifiers;

// const execute = async (message: Message) => {
//   try {
//     const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
//     const description = `${loadEmoji} Atualizando banco de dados...`;
//     const reply = await message.reply({
//       content: `${message.author} ${description}`
//     });
//     const allTables = await mongodbUtils.getAllTables();
//     if (!allTables) {
//       return;
//     }
//     const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
//     const load = async () => {
//       for (let i = 0; i < allTables.length; i += 1) {
//         await timer(1000);
//         const guild = await discordUtils.getGuild(allTables[i].serverId);
//         if (!guild) {
//           return;
//         }
//         const category = await discordUtils.getChannel(
//           allTables[i].categoryChannelId
//         );
//         if (!category) {
//           return;
//         }
//         const channels = [...(category as CategoryChannel).children.values()];
//         if (!channels) {
//           return;
//         }
//         // const contributor = (await discordUtils.getRoles(
//         //   guild,
//         //   Object.values(roles.contributors)
//         // ))![0];
//         // const categoryOverwrites: OverwriteResolvable[] = [
//         //   {
//         //     id: guild.id,
//         //     deny: allPermissions
//         //   },
//         //   {
//         //     id: allTables[i].roleId,
//         //     allow: categoryPlayerPermissions
//         //   },
//         //   {
//         //     id: allTables[i].spectatorRoleId,
//         //     allow: categorySpectatorPermissions
//         //   },
//         //   {
//         //     id: contributor.id,
//         //     allow: categorySpectatorPermissions
//         //   }
//         // ];
//         // const masterShieldOverwrites: OverwriteResolvable[] = [
//         //   {
//         //     id: guild.id,
//         //     deny: allPermissions
//         //   },
//         //   {
//         //     id: allTables[i].masterId,
//         //     allow: categoryPlayerPermissions
//         //   }
//         // ];
//         // const newChannelOverwrites: OverwriteResolvable[] = [
//         //   {
//         //     id: guild.id,
//         //     deny: allPermissions
//         //   },
//         //   {
//         //     id: allTables[i].masterId,
//         //     allow: channelsMasterPermissions
//         //   },
//         //   {
//         //     id: allTables[i].roleId,
//         //     allow: categoryPlayerPermissions
//         //   },
//         //   {
//         //     id: allTables[i].spectatorRoleId,
//         //     allow: categorySpectatorPermissions
//         //   },
//         //   {
//         //     id: contributor.id,
//         //     allow: categorySpectatorPermissions
//         //   }
//         // ];
//         // const spectatortOverwrites: OverwriteResolvable[] = [
//         //   {
//         //     id: guild.id,
//         //     deny: allPermissions
//         //   },
//         //   {
//         //     id: allTables[i].masterId,
//         //     allow: channelsMasterPermissions
//         //   },
//         //   {
//         //     id: allTables[i].roleId,
//         //     allow: categoryPlayerPermissions
//         //   },
//         //   {
//         //     id: allTables[i].spectatorRoleId,
//         //     allow: categoryPlayerPermissions
//         //   },
//         //   {
//         //     id: contributor.id,
//         //     allow: categoryPlayerPermissions
//         //   }
//         // ];
//         for (let j = 0; j < channels.length; j += 1) {
//           await timer(1000);
//           if (!(channels[j] instanceof TextChannel)) {
//             return;
//           }
//           if ((channels[j] as TextChannel).name.includes('escudo-mestre')) {
//             let messageId: string;
//             const messageList = [
//               ...(
//                 await (channels[j] as TextChannel).messages.fetch({
//                   limit: 1000
//                 })
//               ).values()
//             ];
//             const hasMessage = messageList.some((msg) => {
//               if (msg.author.id === config.botId) {
//                 messageId = msg.id;
//               }
//               return msg.author.id === config.botId;
//             });
//             if (!hasMessage) {
//               const text = await messageMasterShield(allTables[i]);
//               const newMessage = await (channels[j] as TextChannel).send({
//                 content: text
//               });
//               await newMessage.pin();
//               messageId = newMessage.id;
//             }
//             await TableSchema.updateOne(
//               {
//                 masterId: allTables[i].masterId
//               },
//               {
//                 shieldChannelId: channels[j].id,
//                 shieldMessageId: messageId || ''
//               }
//             ).exec();
//           }
//         }
//       }
//     };
//     load();

//     await reply.edit({
//       content: `${message.author} ✅ Database atualizada com sucesso.`
//     });
//   } catch (error: any) {
//     // eslint-disable-next-line no-console
//     console.log(
//       `${path.basename(__filename)} > ${error}: ${
//         error.stack ? error.stack : ''
//       }`
//     );
//   }
// };

// const command: Command = {
//   name: 'fill',
//   aliases: [''],
//   description: 'Comando que completa os campos vazios das mesas.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   execute
// };

// export { command };
