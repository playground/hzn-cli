module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).(js|ts|tsx)'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
      '^.+\\.tsx?$': 'ts-jest'
  },
  coverageThreshold: {
      global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
      }
  },
  typeAcquisition: { "include": ["jest"] },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  setupFiles: ['dotenv/config']
};