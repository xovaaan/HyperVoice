const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = path.resolve(__dirname, 'apps/mobile');
const workspaceRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve packages from the workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve relative paths from the project root
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
