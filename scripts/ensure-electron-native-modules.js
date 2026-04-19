const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MODULES = ['better-sqlite3'];

function parseElectronVersion() {
  // Use installed Electron version rather than semver range in package.json.
  const electronPkg = require(path.join(ROOT, 'node_modules', 'electron', 'package.json'));
  const version = electronPkg?.version;
  if (!version || !/^\d+\.\d+\.\d+$/.test(String(version))) {
    throw new Error(`Unable to read installed Electron version: '${String(version)}'`);
  }
  return String(version);
}

function getElectronBinaryPath() {
  const electronPath = require('electron');
  if (!electronPath || typeof electronPath !== 'string') {
    throw new Error('Could not resolve Electron binary path');
  }
  return electronPath;
}

function testModuleInElectron(electronBin, moduleName) {
  const snippet = `
try {
  require(${JSON.stringify(moduleName)});
  process.exit(0);
} catch (error) {
  const msg = error && error.message ? error.message : String(error);
  console.error(msg);
  process.exit(1);
}
`;

  const result = spawnSync(electronBin, ['-e', snippet], {
    cwd: ROOT,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

async function rebuildElectronModules(electronVersion, modules) {
  const { rebuild } = require('@electron/rebuild');

  await rebuild({
    buildPath: ROOT,
    electronVersion,
    force: true,
    onlyModules: modules,
    mode: 'sequential',
  });
}

async function main() {
  const electronVersion = parseElectronVersion();
  const electronBin = getElectronBinaryPath();

  const failing = [];
  for (const moduleName of MODULES) {
    const test = testModuleInElectron(electronBin, moduleName);
    if (!test.ok) {
      failing.push({ moduleName, test });
    }
  }

  if (!failing.length) {
    console.log('[ensure:electron-native] Native modules already compatible with Electron ABI.');
    return;
  }

  console.warn('[ensure:electron-native] Rebuilding Electron native modules...');
  for (const fail of failing) {
    const details = fail.test.stderr || fail.test.stdout || `exit code ${fail.test.status}`;
    console.warn(`  - ${fail.moduleName}: ${details}`);
  }

  const modulesToRebuild = failing.map((f) => f.moduleName);
  await rebuildElectronModules(electronVersion, modulesToRebuild);

  const stillFailing = [];
  for (const moduleName of modulesToRebuild) {
    const test = testModuleInElectron(electronBin, moduleName);
    if (!test.ok) {
      stillFailing.push({ moduleName, test });
    }
  }

  if (stillFailing.length) {
    const lines = stillFailing.map((entry) => {
      const details = entry.test.stderr || entry.test.stdout || `exit code ${entry.test.status}${entry.test.signal ? ` signal=${entry.test.signal}` : ''}`;
      return `- ${entry.moduleName}: ${details}`;
    });
    throw new Error(`Electron native module rebuild failed:\n${lines.join('\n')}`);
  }

  console.log('[ensure:electron-native] Electron native modules rebuilt successfully.');
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error('[ensure:electron-native] Failed:', message);
  process.exit(1);
});
