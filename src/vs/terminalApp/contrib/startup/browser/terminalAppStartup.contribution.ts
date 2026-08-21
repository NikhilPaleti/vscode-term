/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { TerminalLocation } from '../../../../platform/terminal/common/terminal.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../../workbench/common/contributions.js';
import { IEditorGroupsService } from '../../../../workbench/services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService, Parts } from '../../../../workbench/services/layout/browser/layoutService.js';
import { ITerminalService } from '../../../../workbench/contrib/terminal/browser/terminal.js';

/**
 * Shapes the window for terminal-only use:
 *
 * - hides the parts that have no content in this window, once, so a later choice
 *   by the user is not overridden on every start;
 * - makes sure the window is never empty by opening a terminal editor when
 *   nothing was restored.
 */
class TerminalAppStartupContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'terminalApp.startup';

	private static readonly PARTS_HIDDEN_STORAGE_KEY = 'terminalApp.partsHidden';

	constructor(
		@IWorkbenchLayoutService private readonly _layoutService: IWorkbenchLayoutService,
		@IEditorGroupsService private readonly _editorGroupsService: IEditorGroupsService,
		@ITerminalService private readonly _terminalService: ITerminalService,
		@IStorageService private readonly _storageService: IStorageService
	) {
		super();

		this._hidePartsOnce();
		this._ensureTerminal().catch(onUnexpectedError);
	}

	private _hidePartsOnce(): void {
		if (this._storageService.getBoolean(TerminalAppStartupContribution.PARTS_HIDDEN_STORAGE_KEY, StorageScope.PROFILE, false)) {
			return;
		}

		for (const part of [Parts.SIDEBAR_PART, Parts.PANEL_PART, Parts.AUXILIARYBAR_PART]) {
			this._layoutService.setPartHidden(true, part);
		}

		this._storageService.store(TerminalAppStartupContribution.PARTS_HIDDEN_STORAGE_KEY, true, StorageScope.PROFILE, StorageTarget.MACHINE);
	}

	private async _ensureTerminal(): Promise<void> {
		await this._editorGroupsService.whenRestored;

		if (!this._editorGroupsService.groups.every(group => group.isEmpty)) {
			return; // terminals (or other editors) were restored
		}

		const instance = await this._terminalService.createTerminal({ location: TerminalLocation.Editor });
		await instance.focusWhenReady();
	}
}

registerWorkbenchContribution2(TerminalAppStartupContribution.ID, TerminalAppStartupContribution, WorkbenchPhase.AfterRestored);
