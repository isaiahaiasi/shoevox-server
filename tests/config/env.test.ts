import { getEnv, resetEnv } from '../../src/config/env';

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

  test('Calling getEnv multiple times returns same object', () => {
    const env = getEnv();
    const env2 = getEnv();

    expect(env).toBe(env2);
  });

  test("result of getEnv doesn't change between calls", () => {
    const envStr1 = JSON.stringify(getEnv());
    const envStr2 = JSON.stringify(getEnv());

    expect(envStr1).toBe(envStr2);
  });

  test('New env object is returned after resetting env', () => {
    const env = getEnv();
    resetEnv();
    const env2 = getEnv();

    expect(env).not.toBe(env2);
  });

  describe('PORT', () => {
    test('Sets PORT if parsable as a number', () => {
      process.env.PORT = '3000';

      const { PORT } = getEnv();

      expect(PORT).toBe(3000);
    });

    test('Uses fallback PORT if not parsable as number', () => {
      process.env.PORT = 'notanumber';

      const { PORT } = getEnv();

      expect(PORT).not.toBe(process.env.PORT);
      expect(PORT).not.toBeNaN();
      expect(typeof PORT === 'number').toBe(true);
    });

    test('Uses fallback PORT if not defined', () => {
      process.env.PORT = undefined;

      const { PORT } = getEnv();

      expect(PORT).not.toBe(process.env.PORT);
      expect(PORT).not.toBeNaN();
      expect(typeof PORT === 'number').toBe(true);
    });
  });
});
