/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAction } from '../../../../base/common/actions.js';
import { IDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ITerminalCommand } from '../../../../platform/terminal/common/capabilities/capabilities.js';

/**
 * Contributes additional actions to the context menu of a command decoration.
 *
 * This exists so features outside the terminal (for example attaching a command
 * to chat) can extend command decorations without the core terminal depending on
 * their contribution.
 */
export interface ITerminalCommandDecorationActionProvider {
	/**
	 * @param resource The resource of the terminal instance the command ran in, if any.
	 * @param command The command the decoration belongs to.
	 * @returns The actions to add, or `undefined`/empty when nothing applies.
	 */
	provideActions(resource: URI | undefined, command: ITerminalCommand): Promise<IAction[] | undefined> | IAction[] | undefined;
}

class TerminalCommandDecorationActionRegistry {
	private readonly _providers: ITerminalCommandDecorationActionProvider[] = [];

	get providers(): readonly ITerminalCommandDecorationActionProvider[] { return this._providers; }

	register(provider: ITerminalCommandDecorationActionProvider): IDisposable {
		this._providers.push(provider);
		return toDisposable(() => {
			const index = this._providers.indexOf(provider);
			if (index !== -1) {
				this._providers.splice(index, 1);
			}
		});
	}
}

export const TerminalCommandDecorationActions = new TerminalCommandDecorationActionRegistry();
