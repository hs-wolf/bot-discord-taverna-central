import path from 'path';
import { ITableSchema, TableSchema } from '@models/Schemas/TableSchema';
import { logErrors } from '@services/utilities/log-errors';
import { IRpgSchema, RpgSchema } from '@models/Schemas/RpgSchema';

const getTableByName = async (name: string) => {
  try {
    const table = await TableSchema.findOne({
      name
    }).exec();
    return table;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return null;
  }
};

const getTablesByMaster = async (masterId: string) => {
  try {
    const tables = await TableSchema.find({
      masterId
    }).exec();
    return tables;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return null;
  }
};

const getTablesByServer = async (serverId: string) => {
  try {
    const tables = await TableSchema.find({
      serverId
    })
      .sort({ name: 1 })
      .exec();
    return tables;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return null;
  }
};

const getAllTables = async () => {
  try {
    const tables = await TableSchema.find().sort({ name: 1 }).exec();
    return tables;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return null;
  }
};

const getRpgByTitle = async (title: string) => {
  try {
    const rpg = await RpgSchema.findOne({
      title
    }).exec();
    return rpg;
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
    return null;
  }
};

type MongodbUtils = Service & {
  getTableByName: (name: string) => Promise<ITableSchema | null>;
  getTablesByMaster: (idMaster: string) => Promise<ITableSchema[] | null>;
  getTablesByServer: (serverId: string) => Promise<ITableSchema[] | null>;
  getAllTables: () => Promise<ITableSchema[] | null>;
  getRpgByTitle: (title: string) => Promise<IRpgSchema | null>;
};

const mongodbUtils: MongodbUtils = {
  name: path.basename(__filename, path.extname(__filename)),
  description:
    'Serviço que disponibiliza métodos getters e setters utilizando a API do Mongoose.',
  getTableByName,
  getTablesByMaster,
  getTablesByServer,
  getAllTables,
  getRpgByTitle
};

export { mongodbUtils };
