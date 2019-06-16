module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/src/test/ts/**/*.ts'],
  // moduleNameMapper required because jest does not respect tsconfig.json
  // see https://jestjs.io/docs/en/configuration#modulenamemapper-object-string-string
  // and https://www.npmjs.com/package/jest-module-name-mapper
  moduleNameMapper: {
      '^common/(.*)': '<rootDir>/./common/src/main/ts/$1'
  },
  testEnvironment: 'node',
};
