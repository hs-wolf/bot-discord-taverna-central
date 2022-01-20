import { connectDiscord } from '@services/setup/connect-discord';

test('Example Teste', async () => {
  const set = await connectDiscord.connect('WRONG_TOKEN');
  expect(set.done).toEqual(false);
});
