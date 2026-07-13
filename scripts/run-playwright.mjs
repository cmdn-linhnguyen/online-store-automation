import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const MIN_MAJOR = 20;
const MAX_MAJOR = 22;

const getNodeMajor = (version) => {
  const match = /^v?(\d+)\./.exec(version);

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

const isSupportedNode = (version) => {
  const major = getNodeMajor(version);

  return major !== null && major >= MIN_MAJOR && major <= MAX_MAJOR;
};

const compareVersionsDesc = (left, right) => {
  const leftParts = left.replace(/^v/, '').split('.').map(Number);
  const rightParts = right.replace(/^v/, '').split('.').map(Number);

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;

    if (leftPart !== rightPart) {
      return rightPart - leftPart;
    }
  }

  return 0;
};

const candidateNodes = () => {
  const explicit = process.env.PLAYWRIGHT_NODE_BINARY;
  const candidates = [];

  if (explicit) {
    candidates.push(explicit);
  }

  if (isSupportedNode(process.version)) {
    candidates.push(process.execPath);
  }

  const nvmRoot = path.join(homedir(), '.nvm', 'versions', 'node');
  if (existsSync(nvmRoot)) {
    const versions = readdirSync(nvmRoot).sort(compareVersionsDesc);

    for (const version of versions) {
      if (!isSupportedNode(version)) {
        continue;
      }

      candidates.push(path.join(nvmRoot, version, 'bin', 'node'));
    }
  }

  return [...new Set(candidates)];
};

const resolveNodeBinary = () => {
  for (const candidate of candidateNodes()) {
    if (!existsSync(candidate)) {
      continue;
    }

    const result = spawnSync(candidate, ['-p', 'process.version'], { encoding: 'utf8' });
    if (result.status !== 0) {
      continue;
    }

    if (isSupportedNode(result.stdout.trim())) {
      return candidate;
    }
  }

  throw new Error(
    'Could not find a supported Node.js binary for Playwright. Set PLAYWRIGHT_NODE_BINARY to a Node 20-22 executable.',
  );
};

const nodeBinary = resolveNodeBinary();
const cliPath = require.resolve('@playwright/test/cli');
const args = [cliPath, ...process.argv.slice(2)];

const result = spawnSync(nodeBinary, args, {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
