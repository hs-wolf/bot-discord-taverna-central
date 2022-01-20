import path from 'path';
import { setupIds } from '@components/identifiers';
import { setupMsgs } from '@components/messages';
import { logErrors } from '@services/utilities/log-errors';

const execute = () => {
  const env = process.env.APP_ENV as string;

  try {
    setupIds(env);
    setupMsgs(env);
    // eslint-disable-next-line no-console
    console.log(`All components set.`);
  } catch (e: any) {
    logErrors.newLog({ filePath: __filename, err: e });
  }
};

type SetComponents = Service & {
  execute: () => void;
};

const setComponents: SetComponents = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Service that search and sets all custom components.',
  execute
};

export { setComponents };
