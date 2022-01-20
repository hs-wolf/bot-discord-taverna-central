import path from 'path';

const newLog = (obj: { filePath: string; err: any }) => {
  const fileName = path.basename(obj.filePath);
  const formattedError = `${obj.err.name ? `\nName: ${obj.err.name}` : ''}${
    obj.err.message ? `\nMessage: ${obj.err.message}` : ''
  }${obj.err.stack ? `\nStack: ${obj.err.stack}` : ''}`;
  // eslint-disable-next-line no-console
  console.log(`New Error logged from: ${fileName}${formattedError}`);
};

type LogErrors = Service & {
  newLog: (obj: { filePath: string; err: any }) => void;
};

const logErrors: LogErrors = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Service that logs the errors on the console.',
  newLog
};

export { logErrors };
