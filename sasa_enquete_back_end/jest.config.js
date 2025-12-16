module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // 👇 tests dans src/_tests_
  testMatch: ["**/src/_tests_/**/*.test.ts"],

  // 👇 setup global (Prisma, cleanup, etc.)
  setupFilesAfterEnv: ["<rootDir>/src/_tests_/setup.ts"],

  clearMocks: true,
};
// ==================
// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   testMatch: ["**/__tests__/**/*.test.ts"],
// };
