// .onnx'i asset olarak paketle; oyun kuralları ve çevrimdışı tutor repo kökündeki game/ ve tutor/ klasörlerinden gelir (web ile ortak).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('onnx');
config.watchFolders = [path.resolve(__dirname, '../game'), path.resolve(__dirname, '../tutor')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
