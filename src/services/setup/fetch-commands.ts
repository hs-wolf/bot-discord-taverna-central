import fs from 'fs';
import path from 'path';
import { logErrors } from '@services/utilities/log-errors';

const commandsList: Command[] = [];

const execute = async () => {
  const commandsPath: string =
    process.env.APP_ENV === 'dev' ? '/src/commands' : '/dist/commands';

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
    const commandsFolder = path.join(path.resolve(), commandsPath);
    await Promise.all(
      fetchFiles(commandsFolder).map(async (value) => {
        const { command } = await import(value);
        commandsList.push(command);
      })
    );
    // eslint-disable-next-line no-console
    console.log(`Commands fetched.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type FetchCommands = Service & {
  execute: () => Promise<void>;
};
const fetchCommands: FetchCommands = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Fetch all text commands available.',
  execute
};

export { fetchCommands, commandsList };
