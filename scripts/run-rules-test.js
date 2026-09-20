// scripts/run-rules-test.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const jdkPath = 'E:\\o-girador\\OpenJDK26U-jdk_x64_windows_hotspot_26.0.2_10\\jdk-26.0.2+10';
const env = { ...process.env };

if (fs.existsSync(jdkPath)) {
  env.JAVA_HOME = jdkPath;
  env.PATH = `${path.join(jdkPath, 'bin')};${process.env.PATH}`;
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const fullCommand = `${npxCmd} firebase emulators:exec --only firestore,storage "npx vitest run __tests__/security-rules.test.js"`;

console.log('🚀 Lancement des tests de sécurité avec émulateurs Firebase...');
const child = spawn(fullCommand, {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
