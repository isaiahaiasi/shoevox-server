import { fallbacks, getEnv, resetEnv } from '../../src/config/env';

describe('env object is populated successfully from process.env', () => {
  const { env: pEnv } = process;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...pEnv };
  });

  afterEach(() => {
    process.env = pEnv;
    resetEnv();
  });

  describe('PORT', () => {
    test('Uses fallback PORT if not parsable as number', () => {
      process.env.PORT = 'notanumber';

      const { PORT } = getEnv();

      expect(PORT).toBe(fallbacks.PORT);
    });

    test('Sets PORT if parsable as a number', () => {
      process.env.PORT = '3000';

      const { PORT } = getEnv();

      expect(PORT).toBe(3000);
    });

    test('Uses fallback PORT if not defined', () => {
      process.env.PORT = undefined;

      const { PORT } = getEnv();

      expect(PORT).toBe(fallbacks.PORT);
    });
  });
});
