/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IAhpTerminalCommandSource, IChatTerminalOutputSource, IChatTerminalToolProgressPart, ITerminalChatService, ITerminalInstance } from '../../../../workbench/contrib/terminal/browser/terminal.js';
import type { ToolConfirmationAction } from '../../../../workbench/contrib/chat/common/tools/languageModelToolsService.js';

/**
 * A no-op terminal chat service.
 *
 * This service tracks the association between terminals and chat tool sessions.
 * The real implementation in `terminalContrib/chat` injects `IChatService`, so
 * registering it would pull in the whole chat feature. The core terminal injects
 * this service unconditionally -- the tabbed panel view uses it to surface
 * tool-driven background terminals -- so it has to exist.
 *
 * Every terminal in this window is user-created, so there are no tool sessions
 * to track and every query is empty.
 */
class NullTerminalChatService implements ITerminalChatService {

	declare readonly _serviceBrand: undefined;

	readonly onDidRegisterTerminalInstanceWithToolSession = Event.None;
	readonly onDidRegisterOutputSource = Event.None;
	readonly onDidContinueInBackground = Event.None;

	registerTerminalInstanceWithToolSession(): void { }
	async getTerminalInstanceByToolSessionId(): Promise<ITerminalInstance | undefined> { return undefined; }
	registerTerminalInstanceWithExecutionId(): IDisposable { return Disposable.None; }
	getTerminalInstanceByExecutionId(): ITerminalInstance | undefined { return undefined; }
	getToolSessionTerminalInstances(): readonly ITerminalInstance[] { return []; }
	getToolSessionIdForInstance(): string | undefined { return undefined; }
	registerTerminalInstanceWithChatSession(): void { }
	getChatSessionResourceForInstance(): URI | undefined { return undefined; }
	isBackgroundTerminal(): boolean { return false; }
	registerOutputSource(): IDisposable { return Disposable.None; }
	getOutputSource(): IChatTerminalOutputSource | undefined { return undefined; }
	registerProgressPart(): IDisposable { return Disposable.None; }
	setFocusedProgressPart(): void { }
	clearFocusedProgressPart(): void { }
	getFocusedProgressPart(): IChatTerminalToolProgressPart | undefined { return undefined; }
	getMostRecentProgressPart(): IChatTerminalToolProgressPart | undefined { return undefined; }
	setChatSessionAutoApproval(): void { }
	hasChatSessionAutoApproval(): boolean { return false; }
	addSessionAutoApproveRule(): void { }
	getSessionAutoApproveRules(): Readonly<Record<string, boolean | { approve: boolean; matchCommandLine?: boolean }>> { return {}; }
	async getAutoApproveActions(): Promise<ToolConfirmationAction[] | undefined> { return undefined; }
	continueInBackground(): void { }
	registerAhpCommandSource(): IDisposable { return Disposable.None; }
	getAhpCommandSource(): IAhpTerminalCommandSource | undefined { return undefined; }
}

registerSingleton(ITerminalChatService, NullTerminalChatService, InstantiationType.Delayed);
