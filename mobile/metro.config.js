// .onnx'i asset olarak paketle; oyun kuralları repo kökündeki game/ klasöründen gelir (web ile ortak).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('onnx');
config.watchFolders = [path.resolve(__dirname, '../game')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
