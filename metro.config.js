
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// ให้ Metro อ่านไฟล์ .cjs ด้วย
config.resolver.sourceExts.push('cjs');
// ปิดการใช้ package exports ของ ESM เพื่อให้ firebase/auth โหลด native component ได้
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
