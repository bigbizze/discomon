// const { pathsToModuleNameMapper } = require('ts-jest/utils');
// // In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// // which contains the path mapping (ie the `compilerOptions.paths` option):
// const { compilerOptions } = require('./tsconfig');

module.exports = {
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    preset: 'ts-jest',
    testEnvironment: 'node',
    // babelConfig: "--require ts-node/register --require @babel/register"
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest"
    },
    // jest.config.js
    globals: {
        'ts-jest': {
            babelConfig: true
        }
    }
};
