// For a detailed explanation of each configuration property, visit:
// https://jestjs.io/docs/configuration

export default {
  transformIgnorePatterns: [],
  collectCoverage: true,
  collectCoverageFrom: ["index.ts"],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
