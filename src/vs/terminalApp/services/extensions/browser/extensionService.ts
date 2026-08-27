/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExtensionsScannerService, toExtensionDescription } from '../../../../platform/extensionManagement/common/extensionsScannerService.js';
import { ExtensionHostKind } from '../../../../workbench/services/extensions/common/extensionHostKind.js';
import { ExtensionMessageCollector, ExtensionsRegistry, IExtensionPointUser } from '../../../../workbench/services/extensions/common/extensionsRegistry.js';
import { ExtensionPointContribution, IExtensionInspectInfo, IExtensionService, IExtensionsStatus, IResponsiveStateChangeEvent, IWillActivateEvent, WillStopExtensionHostsEvent } from '../../../../workbench/services/extensions/common/extensions.js';
import { IExtensionPoint } from '../../../../workbench/services/extensions/common/extensionsRegistry.js';

/**
 * An extension service that processes declarative contributions without ever
 * creating an extension host.
 *
 * The Terminal window does not load `api/browser/extensionHost.contribution.ts`:
 * it registers every `mainThread*` API implementation and so reaches chat,
 * notebook, debug, scm, testing and comments -- the largest dependency in the
 * workbench. Without it, no extension can run code, and
 * `NativeExtensionHostFactory` would spawn a host that then failed for want of
 * the main-thread API.
 *
 * Declarative contributions need none of that. Extension points are fed by
 * walking each extension's `contributes` section, exactly as
 * `AbstractExtensionService._handleExtensionPoint` does, so the built-in colour,
 * file-icon and product-icon themes register normally.
 *
 * Consequences:
 * - extensions with a `main` entry point can never activate; nothing calls them;
 * - `activateByEvent` and friends resolve without doing anything;
 * - only extensions shipped inside the application are seen. The build ships the
 *   `theme-*` directories and nothing else.
 */
class DeclarativeExtensionService extends Disposable implements IExtensionService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidRegisterExtensions = this._register(new Emitter<void>());
	readonly onDidRegisterExtensions = this._onDidRegisterExtensions.event;

	readonly onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]> = Event.None;
	readonly onDidChangeExtensions: Event<{ readonly added: readonly IExtensionDescription[]; readonly removed: readonly IExtensionDescription[] }> = Event.None;
	readonly onWillActivateByEvent: Event<IWillActivateEvent> = Event.None;
	readonly onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent> = Event.None;
	readonly onWillStop: Event<WillStopExtensionHostsEvent> = Event.None;

	private _extensions: readonly IExtensionDescription[] = [];
	get extensions(): readonly IExtensionDescription[] { return this._extensions; }

	private readonly _registered: Promise<boolean>;

	constructor(
		@IExtensionsScannerService private readonly _extensionsScannerService: IExtensionsScannerService,
		@ILogService private readonly _logService: ILogService
	) {
		super();

		this._registered = this._registerDeclarativeContributions();
	}

	private async _registerDeclarativeContributions(): Promise<boolean> {
		try {
			const scanned = await this._extensionsScannerService.scanSystemExtensions({});
			this._extensions = scanned.map(extension => toExtensionDescription(extension, false));
		} catch (error) {
			// A missing or unreadable extensions directory is not fatal: it just
			// means no declarative contributions, which is a valid configuration.
			this._logService.warn('[DeclarativeExtensionService] could not scan built-in extensions', error);
			this._extensions = [];
		}

		for (const extensionPoint of ExtensionsRegistry.getExtensionPoints()) {
			const users: IExtensionPointUser<unknown>[] = [];
			for (const description of this._extensions) {
				const contributes = description.contributes as Record<string, unknown> | undefined;
				if (contributes && Object.prototype.hasOwnProperty.call(contributes, extensionPoint.name)) {
					users.push({
						description,
						value: contributes[extensionPoint.name],
						collector: new ExtensionMessageCollector(
							msg => this._logService.warn(`[${msg.extensionId?.value}] ${msg.message}`),
							description,
							extensionPoint.name
						)
					});
				}
			}
			if (users.length) {
				extensionPoint.acceptUsers(users);
			}
		}

		this._logService.trace(`[DeclarativeExtensionService] registered ${this._extensions.length} built-in extension(s)`);
		this._onDidRegisterExtensions.fire();

		return true;
	}

	whenInstalledExtensionsRegistered(): Promise<boolean> {
		return this._registered;
	}

	async getExtension(id: string): Promise<IExtensionDescription | undefined> {
		await this._registered;
		return this._extensions.find(extension => ExtensionIdentifier.equals(extension.identifier, id));
	}

	async readExtensionPointContributions<T>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]> {
		await this._registered;
		const result: ExtensionPointContribution<T>[] = [];
		for (const description of this._extensions) {
			const contributes = description.contributes as Record<string, unknown> | undefined;
			if (contributes && Object.prototype.hasOwnProperty.call(contributes, extPoint.name)) {
				result.push(new ExtensionPointContribution<T>(description, contributes[extPoint.name] as T));
			}
		}
		return result;
	}

	// No extension can run code in this window, so activation is a no-op.
	activateByEvent(): Promise<void> { return Promise.resolve(); }
	activateById(): Promise<void> { return Promise.resolve(); }
	activationEventIsDone(): boolean { return false; }
	getExtensionsStatus(): { [id: string]: IExtensionsStatus } { return Object.create(null); }
	getInspectPorts(_kind: ExtensionHostKind, _tryEnableInspector: boolean): Promise<IExtensionInspectInfo[]> { return Promise.resolve([]); }
	async stopExtensionHosts(): Promise<boolean> { return true; }
	async startExtensionHosts(): Promise<void> { }
	async setRemoteEnvironment(): Promise<void> { }
	canAddExtension(): boolean { return false; }
	canRemoveExtension(): boolean { return false; }
}

registerSingleton(IExtensionService, DeclarativeExtensionService, InstantiationType.Eager /* processes theme contributions at startup */);
