// For a detailed explanation of each configuration property, visit:
// https://jestjs.io/docs/configuration

export default {
  transformIgnorePatterns: [],
  collectCoverage: true,
  collectCoverageFrom: ["index.ts"],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 76,
      functions: 100,
      lines: 100,
    },
  },
};
