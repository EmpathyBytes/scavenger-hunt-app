const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .glb to assetExts so Metro can bundle 3D models
config.resolver.assetExts.push('glb');

module.exports = config;
