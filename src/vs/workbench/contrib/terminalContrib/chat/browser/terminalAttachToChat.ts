/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAction } from '../../../../../base/common/actions.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { TerminalContext } from '../../../chat/browser/actions/chatContext.js';
import { IChatContextPickService } from '../../../chat/browser/attachments/chatContextPickService.js';
import { IChatWidgetService } from '../../../chat/browser/chat.js';
import { ChatAgentLocation } from '../../../chat/common/constants.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ITerminalCommandDecorationActionProvider, TerminalCommandDecorationActions } from '../../../terminal/browser/terminalDecorationActions.js';
import { getTerminalUri, parseTerminalUri } from '../../../terminal/browser/terminalUri.js';

/**
 * Contributes the "Attach To Chat" action to the context menu of a command
 * decoration. Lives here rather than in the terminal so the core terminal does
 * not depend on the chat contribution.
 */
export class TerminalAttachToChatActionProvider extends Disposable implements ITerminalCommandDecorationActionProvider {

	constructor(
		@IChatContextPickService private readonly _contextPickService: IChatContextPickService,
		@IChatWidgetService private readonly _chatWidgetService: IChatWidgetService,
		@IInstantiationService private readonly _instantiationService: IInstantiationService
	) {
		super();
	}

	provideActions(resource: URI | undefined, command: ITerminalCommand): IAction[] | undefined {
		const chatIsEnabled = this._chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat).some(w => w.attachmentCapabilities.supportsTerminalAttachments);
		if (!chatIsEnabled) {
			return undefined;
		}
		const labelAttachToChat = localize("terminal.attachToChat", 'Attach To Chat');
		return [{
			class: undefined, tooltip: labelAttachToChat, id: 'terminal.attachToChat', label: labelAttachToChat, enabled: true,
			run: async () => {
				let widget = this._chatWidgetService.lastFocusedWidget ?? this._chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat)?.find(w => w.attachmentCapabilities.supportsTerminalAttachments);

				// If no widget found (e.g., after window reload when chat hasn't been focused), open chat view
				if (!widget) {
					widget = await this._chatWidgetService.revealWidget();
				}

				if (!widget) {
					return;
				}

				let terminalContext: TerminalContext | undefined;
				if (resource) {
					const parsedUri = parseTerminalUri(resource);
					terminalContext = this._instantiationService.createInstance(TerminalContext, getTerminalUri(parsedUri.workspaceId, parsedUri.instanceId!, undefined, command.id));
				}

				if (terminalContext && widget.attachmentCapabilities.supportsTerminalAttachments) {
					try {
						const attachment = await terminalContext.asAttachment(widget);
						if (attachment) {
							widget.attachmentModel.addContext(attachment);
							widget.focusInput();
							return;
						}
					} catch (err) {
					}
					this._store.add(this._contextPickService.registerChatContextItem(terminalContext));
				}
			}
		}];
	}
}

export class TerminalAttachToChatContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'terminal.attachToChat';

	constructor(
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super();

		const provider = this._register(instantiationService.createInstance(TerminalAttachToChatActionProvider));
		this._register(TerminalCommandDecorationActions.register(provider));
	}
}
