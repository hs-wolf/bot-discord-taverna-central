// import { Message } from 'discord.js';
// import { identifiers } from '@components/identifiers';
// import { discordUtils } from '@services/utilities/discord-utils';
// import campaigns from '@data/campaigns.json';
// import { TableSchema } from '@models/Schemas/TableSchema';
// import { mongodbUtils } from '@services/utilities/mongodb-utils';

// const { customEmojis, roles } = identifiers;

// const execute = async (message: Message) => {
//   try {
//     const loadEmoji = await discordUtils.getEmoji(customEmojis.loading);
//     const description = `${loadEmoji} Atualizando banco de dados...`;
//     const reply = await message.reply({
//       content: `${message.author} ${description}`
//     });
//     const campaignDocs = [...campaigns];

//     campaignDocs.forEach(async (campaign) => {
//       if (campaign.name) {
//         const tableExists = await mongodbUtils.getTableByName(campaign.name);
//         if (!tableExists) {
//           return;
//         }
//         const guild = await discordUtils.getGuild(tableExists.serverId);
//         if (!guild) {
//           await TableSchema.findOneAndDelete({
//             name: tableExists.name
//           }).exec();
//         }
//         const category = await discordUtils.getChannel(
//           tableExists.categoryChannelId
//         );
//         if (!category) {
//           await TableSchema.findOneAndDelete({
//             name: campaign.name
//           }).exec();
//         }
//       }
//     });

//     await reply.edit({
//       content: `${message.author} ✅ Database atualizada com sucesso.`
//     });
//   } catch (error: any) {
//     // TODO log error
//   }
// };

// const command: Command = {
//   name: 'clean-database',
//   aliases: ['clean-db'],
//   description: 'Comando que limpa o banco de dados do bot.',
//   protections: new Map(),
//   cooldowns: new Map(),
//   roles: roles.sectorAdministration,
//   execute
// };

// export { command };
