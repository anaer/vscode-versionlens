const fs = require('fs');
const path = require('path');
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const buildPath = __dirname;
const projectPath = path.resolve(buildPath, '..');
const sourcePath = path.resolve(projectPath, 'src');
const testPath = path.resolve(projectPath, 'test');
const distPath = path.resolve(projectPath, 'dist');

module.exports = function (env, argv) {

  const logging = env && env.logging == 'true'
  const test = env && env.test == 'true'

  const entry = test ?
    path.resolve(testPath, 'runner.ts') :
    path.resolve(sourcePath, 'activate.ts');

  const tsconfigFile = path.resolve(projectPath, 'tsconfig.json');

  const outputFile = test ?
    'extension.test.js' :
    'extension.bundle.js'

  console.log("[info] " + tsconfigFile)

  return {

    target: 'node',

    node: {
      __dirname: false
    },

    entry,

    externalsType: 'commonjs',
    externals: generateExternals(),

    resolve: {
      extensions: ['.ts'],
      alias: generateAliases(),
      plugins: [
        new tsconfigPathsPlugin(
          {
            configFile: path.resolve(projectPath, "tsconfig.json")
          }
        )
      ],
    },

    module: {
      rules: [{
        test: /\.ts?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: tsconfigFile,
            transpileOnly: true
          }
        }]
      }]
    },

    devtool: 'source-map',

    output: {
      clean: true,
      path: distPath,
      filename: outputFile,
      libraryTarget: "commonjs2",
      devtoolModuleFilenameTemplate: "../[resource-path]",
    },

  }

  function generateAliases() {
    log("[debug] Generating aliases")

    let aliases = {
      ...generateDynamicImportAliases(''),
      ...generateDynamicImportAliases('infrastructure/providers')
    }

    log("[debug] Generated aliases", aliases)

    return aliases;
  }

  function generateDynamicImportAliases(relativePath) {
    log("[debug] Generating area aliases for " + relativePath)

    const areaAliases = {}
    const areaPrefix = relativePath.length > 0 ?
      `${relativePath}/` :
      relativePath;

    getDirectories(path.resolve(sourcePath, relativePath))
      .sort()
      .map(areaPath => ({ areaName: path.basename(areaPath), areaPath }))
      .forEach(
        area => {
          const areaFullName = `${areaPrefix}${area.areaName}`;
          const areaFullPath = path.resolve(sourcePath, relativePath, area.areaPath);
          const indexTestPath = path.resolve(areaFullPath, 'index.test.ts');

          areaAliases[areaFullName] = areaFullPath;
          if (test && fs.existsSync(indexTestPath)) {
            areaAliases['test.' + areaFullName] = indexTestPath;
          }
        }
      )

    return areaAliases;
  }

  // Finds all the node_modules package names.
  // Returns a object map of strings {"{moduleName}": true, ...} to mark them as nodejs modules
  function generateExternals() {
    const externals = {
      "vscode": true,
      "@npmcli/promise-spawn": true
    }

    getDirectories(path.resolve(projectPath, 'node_modules'))
      .forEach(moduleName => externals[moduleName] = true)

    return [
      externals,
      /package\.json$/,
    ]
  }

  function getDirectories(absolutePath) {
    return fs.readdirSync(absolutePath).filter(
      file => fs.statSync(absolutePath + '/' + file).isDirectory()
    )
  }

  function log(message, ...optional) {
    if (logging) console.log(message, ...optional)
  }

}