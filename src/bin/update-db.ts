// import { Message } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { discordUtils } from '@services/utilities/discord-utils';
// import campaigns from '@data/campaigns.json';
// import { TableSchema } from '@models/Schemas/TableSchema';

// const { config, customEmojis, roles } = identifiers;

// const execute = async (message: Message) => {
//   try {
//     const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
//     const description = `${loadEmoji} Atualizando banco de dados...`;
//     const reply = await message.reply({
//       content: `${message.author} ${description}`
//     });
//     const campaignDocs = [...campaigns];

//     const newTables = campaignDocs.map((campaign) => {
//       const currentTable: Table = {
//         serverId: '',
//         masterId: '',
//         name: '',
//         emoji: '',
//         imageLink: '',
//         roleId: '',
//         spectatorRoleId: '',
//         categoryChannelId: '',
//         shieldChannelId: '',
//         shieldMessageId: '',
//         spectatorAllowed: false,
//         activityScore: 0,
//         lastRpgDate: new Date()
//       };
//       currentTable.serverId = campaign.serverLocated || '?';
//       currentTable.masterId = campaign.idMaster || '?';
//       currentTable.name = campaign.name || '?';
//       currentTable.emoji = '?';
//       currentTable.imageLink = config.tableImageUrl;
//       currentTable.roleId = campaign.idRole || '?';
//       currentTable.spectatorRoleId = campaign.idRoleSpec || '?';
//       currentTable.categoryChannelId = campaign.idChannelGeneral || '?';
//       currentTable.shieldChannelId = '?';
//       currentTable.shieldMessageId = '?';
//       currentTable.spectatorAllowed = campaign.acceptSpec || false;
//       currentTable.activityScore = campaign.activity;
//       currentTable.lastRpgDate = new Date();
//       return currentTable;
//     });

//     // eslint-disable-next-line no-restricted-syntax
//     for await (const table of newTables) {
//       setTimeout(async () => {
//         await new TableSchema({
//           ...table
//         }).save();
//       }, 1000);
//     }

//     await reply.edit({
//       content: `${message.author} ✅ Database atualizada com sucesso.`
//     });
//   } catch (error: any) {
//     // TODO log error
//   }
// };

// const command: Command = {
//   name: 'update-database',
//   aliases: ['update-db'],
//   description: 'Comando que atualiza o banco de dados do bot.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   execute
// };

// export { command };
