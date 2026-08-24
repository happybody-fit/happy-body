import { readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const packageFolder = readdirSync('node_modules/.pnpm').find((name) => name.startsWith('esbuild@'));
if (!packageFolder) throw new Error('esbuild is required to bundle the TypeScript recommendation tests.');

const esbuild = join('node_modules/.pnpm', packageFolder, 'node_modules/esbuild/bin/esbuild');
const output = join(tmpdir(), 'happy-body-recommendations.test.mjs');
const build = spawnSync(process.execPath, [esbuild, 'tests/recommendations.test.ts', '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const tests = spawnSync(process.execPath, ['--test', output], { stdio: 'inherit' });
process.exit(tests.status ?? 1);
