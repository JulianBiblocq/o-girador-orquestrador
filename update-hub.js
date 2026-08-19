const fs = require('fs');

const viteConfigPath = '../o-girador-manager/vite.config.js';
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
viteConfig = viteConfig.replace(
  "navigateFallbackDenylist: [/^\\/__/],",
  "navigateFallbackDenylist: [/^\\/__/, /^\\/robots\\.txt$/, /^\\/sitemap\\.xml$/],"
);
fs.writeFileSync(viteConfigPath, viteConfig);

const packageJsonPath = '../o-girador-manager/package.json';
let packageJson = fs.readFileSync(packageJsonPath, 'utf8');
packageJson = packageJson.replace(
  '"version": "1.3.10",',
  '"version": "1.3.11",'
);
fs.writeFileSync(packageJsonPath, packageJson);

console.log("Files updated successfully.");
