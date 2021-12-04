import { add } from '@modules/example';

test('Example Teste', () => {
  const nm = add(5, 5);
  expect(nm).toEqual(10);
});
