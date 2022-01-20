import path from 'path';
import Mongoose, { ConnectOptions } from 'mongoose';
import { logErrors } from '@services/utilities/log-errors';

const execute = async () => {
  const uri: string =
    process.env.APP_ENV === 'dev'
      ? (process.env.MONGODB_URI_DEV as string)
      : (process.env.MONGODB_URI_PROD as string);

  try {
    const options: ConnectOptions = {};
    await Mongoose.connect(`${uri}`, options);
    // eslint-disable-next-line no-console
    console.log(`Connected to MongoDB.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type ConnectMongoDB = Service & {
  execute: () => Promise<void>;
};
const connectMongoDB: ConnectMongoDB = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Service that connects the app to MonogoDB API using Mongoose.',
  execute
};

export { connectMongoDB };
