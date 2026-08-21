/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Guards the Terminal window's dependency budget.
//
// The window is small because a handful of specific edges into other feature
// areas are cut. Those cuts are easy to undo by accident: adding one import can
// pull a whole feature area back into the bundle. This script walks the module
// graph from the Terminal window entry point and fails if a forbidden area is
// reachable, printing the exact import path that reintroduced it.
//
// Usage: node scripts/terminal-app-budget.mjs

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ENTRY = 'src/vs/terminalApp/terminalApp.desktop.main.ts';

/**
 * Feature areas the Terminal window must not reach. Each entry is matched as a
 * substring of the module path.
 */
const FORBIDDEN = [
	'src/vs/workbench/api/browser/',
	'src/vs/workbench/contrib/chat/',
	'src/vs/workbench/contrib/comments/',
	'src/vs/workbench/contrib/debug/',
	'src/vs/workbench/contrib/inlineChat/',
	'src/vs/workbench/contrib/notebook/',
	'src/vs/workbench/contrib/scm/',
	'src/vs/workbench/contrib/search/browser/',
	'src/vs/workbench/contrib/tasks/browser/',
	'src/vs/workbench/contrib/testing/',
	'src/vs/workbench/contrib/welcomeGettingStarted/',
];

const depsCache = new Map();

/** Resolved, value-level (non type-only) relative imports of a module. */
function deps(file) {
	const cached = depsCache.get(file);
	if (cached) {
		return cached;
	}

	let result = [];
	const abs = path.join(root, file);
	if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
		const text = fs.readFileSync(abs, 'utf8');
		const all = new Map();
		for (const match of text.matchAll(/(?:from|import)\s+'([^']+)'/g)) {
			all.set(match[1], (all.get(match[1]) ?? 0) + 1);
		}
		// `import type ... from 'x'` is erased at compile time and costs nothing.
		const typeOnly = new Map();
		for (const match of text.matchAll(/\bimport\s+type\s+[^;]*?from\s+'([^']+)'/g)) {
			typeOnly.set(match[1], (typeOnly.get(match[1]) ?? 0) + 1);
		}

		const dir = path.dirname(file);
		for (const [spec, count] of all) {
			if (!spec.startsWith('.') || count <= (typeOnly.get(spec) ?? 0)) {
				continue;
			}
			let resolved = path.normalize(path.join(dir, spec));
			if (resolved.endsWith('.js')) {
				resolved = `${resolved.slice(0, -3)}.ts`;
			} else if (!resolved.endsWith('.ts') && !resolved.endsWith('.css')) {
				resolved = `${resolved}.ts`;
			}
			// Some modules are typed by a hand-written declaration file next to a
			// bundled dependency (`xterm-private.d.ts`, `semver.d.ts`, ...). Those
			// carry no source of their own.
			if (resolved.endsWith('.ts') && !fs.existsSync(path.join(root, resolved)) && fs.existsSync(path.join(root, `${resolved.slice(0, -3)}.d.ts`))) {
				continue;
			}
			result.push(resolved);
		}
	}

	depsCache.set(file, result);
	return result;
}

const parents = new Map([[ENTRY, undefined]]);
const seen = new Set();
const violations = [];
const unresolved = [];
const stack = [ENTRY];

while (stack.length) {
	const file = stack.pop();
	if (seen.has(file)) {
		continue;
	}
	seen.add(file);

	const forbidden = FORBIDDEN.find(area => file.includes(area));
	if (forbidden) {
		violations.push({ file, area: forbidden });
		continue; // do not walk into it; the entry edge is what matters
	}

	for (const dep of deps(file)) {
		if (!parents.has(dep)) {
			parents.set(dep, file);
		}
		if (!fs.existsSync(path.join(root, dep))) {
			unresolved.push({ from: file, to: dep });
			continue;
		}
		stack.push(dep);
	}
}

const reachable = [...seen].filter(f => fs.existsSync(path.join(root, f)) && !violations.some(v => v.file === f));
const bytes = reachable.reduce((total, f) => total + fs.statSync(path.join(root, f)).size, 0);

console.log(`Terminal window reachable modules: ${reachable.length}`);
console.log(`Terminal window source bytes:      ${(bytes / 1024 / 1024).toFixed(1)} MB`);

if (unresolved.length) {
	console.error(`\n${unresolved.length} import(s) could not be resolved on disk:\n`);
	for (const { from, to } of unresolved) {
		console.error(`  ${from}\n      -> ${to}`);
	}
}

if (!violations.length && !unresolved.length) {
	console.log('\nNo forbidden feature area is reachable.');
	process.exit(0);
}

if (!violations.length) {
	process.exit(1);
}

// Group by area and show the import chain that reintroduced each one.
const byArea = new Map();
for (const violation of violations) {
	if (!byArea.has(violation.area)) {
		byArea.set(violation.area, []);
	}
	byArea.get(violation.area).push(violation.file);
}

console.error(`\n${violations.length} module(s) from ${byArea.size} forbidden area(s) are reachable:\n`);
for (const [area, files] of byArea) {
	console.error(`  ${area}  (${files.length} module(s))`);
	// The shortest chain is the most actionable one to fix.
	let shortest;
	for (const file of files) {
		const chain = [];
		for (let at = file; at !== undefined; at = parents.get(at)) {
			chain.unshift(at);
		}
		if (!shortest || chain.length < shortest.length) {
			shortest = chain;
		}
	}
	for (const [index, step] of shortest.entries()) {
		console.error(`${'    '}${'  '.repeat(index === 0 ? 0 : 1)}${index === 0 ? '' : '-> '}${step}`);
	}
	console.error('');
}
console.error('Either drop the import, or move the coupling behind a registry/command as');
console.error('the existing cuts do (see src/vs/terminalApp/README.md).');
process.exit(1);
