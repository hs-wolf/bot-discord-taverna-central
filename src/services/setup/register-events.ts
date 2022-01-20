import fs from 'fs';
import path from 'path';
import { client } from '@services/setup/connect-discord';
import { logErrors } from '@services/utilities/log-errors';

const execute = async () => {
  const eventsPath: string =
    process.env.APP_ENV === 'dev' ? '/src/events' : '/dist/events';

  try {
    const fetchFiles = (filePath: string, previousFiles?: string[]) => {
      const files = fs.readdirSync(filePath);
      let currentFiles: string[] = [];
      if (previousFiles) {
        currentFiles = previousFiles;
      }
      files.forEach((file) => {
        if (fs.statSync(`${filePath}/${file}`).isDirectory()) {
          currentFiles = fetchFiles(`${filePath}/${file}`, currentFiles);
        } else {
          currentFiles.push(path.join(filePath, '/', file));
        }
      });
      return currentFiles;
    };
    const eventsFolder = path.join(path.resolve(), eventsPath);
    await Promise.all(
      fetchFiles(eventsFolder).map(async (value) => {
        const req = await require(`${value}`);
        const event = req.event as Event;
        if (event.once) {
          client.once(event.name, (...args: any[]) => event.execute(...args));
        } else {
          client.on(event.name, (...args: any[]) => event.execute(...args));
        }
      })
    );
    // eslint-disable-next-line no-console
    console.log(`Discord Events registered.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type RegisterEvents = Service & {
  execute: () => Promise<void>;
};
const registerEvents: RegisterEvents = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Register on the Discord client, all Discord events available.',
  execute
};

export { registerEvents };
