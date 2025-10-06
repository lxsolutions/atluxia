const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for absolute imports
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@': `${__dirname}/app`,
};

module.exports = config;