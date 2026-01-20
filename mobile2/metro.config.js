const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for Turbo modules and fix asset resolution
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Ensure resolver is properly configured
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver.sourceExts || []), "cjs"],
};

module.exports = config;
