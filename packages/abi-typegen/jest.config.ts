import baseConfig from '@internals/configs/jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseConfig,
  transform: {
    '\\.hbs': 'jest-text-transformer',
  },
};

export default config;
