import path from 'path';

const create = () => {
  // eslint-disable-next-line no-console
  console.log('Watchers: Age selector created.');
};

type AgeSelector = Service & {
  create: () => void;
};

const ageSelector: AgeSelector = {
  name: path.basename(__filename, path.extname(__filename)),
  description: 'Creates an age selector on the registry channel.',
  create
};

export { ageSelector };
