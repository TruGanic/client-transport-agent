const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep .wasm configuration
config.resolver.assetExts.push('wasm');

// Wrap and export the config with NativeWind
// The 'input' should point to global CSS file
module.exports = withNativeWind(config, { input: './global.css' });