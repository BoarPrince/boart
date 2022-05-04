// jest.config.ts
import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
    roots: ['packages'],
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: false,
    automock: false,
    clearMocks: true,
    globals: {
        gauge: {
            dataStore: {}
        }
    },
    setupFilesAfterEnv: ["jest-extended/all"],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts)$",
    moduleFileExtensions: [
      "ts",
      "js",
      "json"
    ],
    collectCoverageFrom: [
        "**/src/*/**/*.ts"
    ],
    coveragePathIgnorePatterns: [
        "node_modules"
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    // setupFiles: [
    //     './setupJest.js'
    //   ]
}
export default config