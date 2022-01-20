import development from '@data/ids-dev.json';
import production from '@data/ids-prod.json';

let identifiers = {
  ...development
};

const setupIds = (env: string) => {
  identifiers = {
    ...(env === 'dev' ? development : production)
  };
};

export { setupIds, identifiers };
