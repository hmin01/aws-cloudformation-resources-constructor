module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/main.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
