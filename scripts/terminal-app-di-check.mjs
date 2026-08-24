/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Checks that every service the Terminal window injects is actually registered.
//
// Trimming the contribution set can silently remove the only `registerSingleton`
// for a service that surviving code still injects. That is invisible to the
// compiler and to the dependency budget: it only shows up at runtime as
// "[createInstance] X depends on UNKNOWN service y". This walks the module graph
// from the entry point, collects what is provided and what is required, and
// reports the difference.
//
// Usage: node scripts/terminal-app-di-check.mjs

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ENTRY = 'src/vs/terminalApp/terminalApp.desktop.main.ts';

/**
 * Service ids the instantiation service provides intrinsically, so they never
 * appear as a registration.
 */
const INTRINSIC = new Set(['instantiationService']);

/**
 * Service id -> why it is legitimately unregistered in this window. These are not
 * provided by a `registerSingleton` the walk can see, and each has been checked
 * against the code path that would need it.
 */
const EXPECTED_ABSENT = new Map([
	['editorProgressService', 'provided scoped per editor group, see editorGroupView.ts'],
	['IUserDataSyncStoreService', 'registered in sharedProcessMain; the synchronizers run there, not in the renderer'],
	['IUserDataSyncLocalStoreService', 'registered in sharedProcessMain; the synchronizers run there, not in the renderer'],
	['agentHostByokLmHandler', 'optional bridge: agentHostClientByokLmChannel logs a warning and continues without it'],
	['terminalChatService', 'remaining consumer AgentHostTerminalService is registered Delayed and only injected by vs/sessions and contrib/chat, neither of which this window loads'],
	['workbenchIssueService', 'only injected by the Extensions viewlet actions, which this window never instantiates'],
]);

/**
 * Decorator name -> service id. A decorator is either created with an id of its
 * own, or refines another decorator and shares that decorator's id -- which is
 * why matching on decorator names alone reports false positives (for example
 * `IWorkbenchConfigurationService` refines `IConfigurationService`).
 */
function buildServiceIdMap() {
	const created = new Map();
	const refines = new Map();
	const walk = dir => {
		for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
			const rel = `${dir}/${entry.name}`;
			if (entry.isDirectory()) {
				if (entry.name !== 'test' && entry.name !== 'node_modules') {
					walk(rel);
				}
			} else if (entry.name.endsWith('.ts')) {
				const text = fs.readFileSync(path.join(root, rel), 'utf8');
				for (const m of text.matchAll(/export\s+const\s+(I[A-Za-z0-9_]+)\s*(?::[^=]+)?=\s*createDecorator\s*<[^>]*>\s*\(\s*'([^']+)'/g)) {
					created.set(m[1], m[2]);
				}
				for (const m of text.matchAll(/export\s+const\s+(I[A-Za-z0-9_]+)\s*(?::[^=]+)?=\s*refineServiceDecorator\s*<[\s\S]*?>\s*\(\s*(I[A-Za-z0-9_]+)\s*\)/g)) {
					refines.set(m[1], m[2]);
				}
			}
		}
	};
	walk('src/vs');

	const idOf = name => {
		const seen = new Set();
		let cur = name;
		while (cur && !seen.has(cur)) {
			seen.add(cur);
			if (created.has(cur)) {
				return created.get(cur);
			}
			cur = refines.get(cur);
		}
		return undefined;
	};
	const map = new Map();
	for (const name of [...created.keys(), ...refines.keys()]) {
		const id = idOf(name);
		if (id) {
			map.set(name, id);
		}
	}
	return map;
}

const SERVICE_ID = buildServiceIdMap();
const idFor = name => SERVICE_ID.get(name) ?? `?${name}`;

const depsCache = new Map();

function deps(file) {
	const cached = depsCache.get(file);
	if (cached) {
		return cached;
	}
	const result = [];
	const abs = path.join(root, file);
	if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
		const text = fs.readFileSync(abs, 'utf8');
		const dir = path.dirname(file);
		const all = new Map();
		for (const m of text.matchAll(/(?:from|import)\s+'([^']+)'/g)) {
			all.set(m[1], (all.get(m[1]) ?? 0) + 1);
		}
		const typeOnly = new Map();
		for (const m of text.matchAll(/\bimport\s+type\s+[^;]*?from\s+'([^']+)'/g)) {
			typeOnly.set(m[1], (typeOnly.get(m[1]) ?? 0) + 1);
		}
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
			if (resolved.endsWith('.css') || !fs.existsSync(path.join(root, resolved))) {
				continue;
			}
			result.push(resolved);
		}
	}
	depsCache.set(file, result);
	return result;
}

// Walk the graph.
const reachable = new Set();
const stack = [ENTRY];
while (stack.length) {
	const file = stack.pop();
	if (reachable.has(file)) {
		continue;
	}
	reachable.add(file);
	stack.push(...deps(file));
}

const provided = new Set();
const required = new Map(); // service -> Set<file>

for (const file of reachable) {
	if (!file.endsWith('.ts')) {
		continue;
	}
	const text = fs.readFileSync(path.join(root, file), 'utf8');

	// Provided: registerSingleton / remote service registrations / bootstrap sets.
	for (const m of text.matchAll(/register(?:Singleton|MainProcessRemoteService|SharedProcessRemoteService)\s*\(\s*(I[A-Za-z0-9_]+)/g)) {
		provided.add(idFor(m[1]));
	}
	for (const m of text.matchAll(/serviceCollection\.set\s*\(\s*(I[A-Za-z0-9_]+)/g)) {
		provided.add(idFor(m[1]));
	}

	// Required: constructor parameter decorators, excluding @optional(...).
	for (const m of text.matchAll(/@(I[A-Za-z0-9_]+)\s+(?:private|public|protected|readonly)/g)) {
		const id = idFor(m[1]);
		if (!required.has(id)) {
			required.set(id, { names: new Set(), files: new Set() });
		}
		required.get(id).names.add(m[1]);
		required.get(id).files.add(file);
	}
	// `@optional(IFoo)` sites are not collected as required above, because the
	// required pattern only matches a bare `@IFoo` decorator. Nothing to do here:
	// marking the service as provided would wrongly excuse its other consumers.
}

const missing = [...required.keys()]
	.filter(id => !provided.has(id) && !INTRINSIC.has(id) && !EXPECTED_ABSENT.has(id))
	.sort();

const excused = [...required.keys()].filter(id => !provided.has(id) && EXPECTED_ABSENT.has(id)).sort();

console.log(`Terminal window modules walked: ${reachable.size}`);
console.log(`services registered:            ${provided.size}`);
console.log(`services injected:              ${required.size}`);

if (excused.length) {
	console.log(`\nunregistered but expected (${excused.length}):`);
	for (const id of excused) {
		console.log(`  ${id} -- ${EXPECTED_ABSENT.get(id)}`);
	}
}

if (!missing.length) {
	console.log('\nEvery other injected service is registered.');
	process.exit(0);
}

console.error(`\n${missing.length} injected service(s) have no registration in this window:\n`);
for (const id of missing) {
	const { names, files } = required.get(id);
	const users = [...files].sort();
	console.error(`  ${[...names].join(' / ')}   (id: ${id})`);
	for (const u of users.slice(0, 5)) {
		console.error(`      ${u.replace('src/vs/', '')}`);
	}
	if (users.length > 5) {
		console.error(`      ... +${users.length - 5} more`);
	}
}
console.error('\nEither register the service, drop the consumer, or make the injection @optional.');
process.exit(1);
