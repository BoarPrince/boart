// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    roots: ['src/packages'],
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
    modulePathIgnorePatterns: ['./src/packagages/.*/dist/', './dist/'],
    coveragePathIgnorePatterns: ['node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: ['**/src/*/**/*.ts', '!**/src/*/**/*.enum.ts', '!**/src/*/**/*.d.ts'],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    moduleNameMapper: {
        '^@boart/core$': '<rootDir>/src/packages/core/src/index.ts',
        '^@boart/core-impl$': '<rootDir>/src/packages/core-impl/src/index.ts',
        '^@boart/execution$': '<rootDir>/src/packages/execution/src/index.ts',
        '^@boart/protocol$': '<rootDir>/src/packages/protocol/src/index.ts',
        '^@boart/basic$': '<rootDir>/src/packages/basic/src/index.ts'
    }
    // setupFiles: [
    //     './setupJest.js'
    //   ]
};
export default config;
