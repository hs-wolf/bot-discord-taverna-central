import development from '@data/msgs-dev.json';
import production from '@data/msgs-prod.json';

let messages = {
  ...development
};

const setupMsgs = (env: string) => {
  messages = {
    ...(env === 'dev' ? development : production)
  };
};

export { setupMsgs, messages };
