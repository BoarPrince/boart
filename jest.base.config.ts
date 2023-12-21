// jest.config.ts
const config = {
    roots: ['src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: false,
    automock: false,
    clearMocks: true,
    setupFilesAfterEnv: ['jest-extended/all'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts)$',
    modulePathIgnorePatterns: ['./lib/'],
    coveragePathIgnorePatterns: ['node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: ['./src/*/**/*.ts', '!./src/*/**/*.enum.ts', '!./src/*/**/*.d.ts'],
    coverageReporters: ['json', 'lcov', 'text', 'clover']
};
export default config;
