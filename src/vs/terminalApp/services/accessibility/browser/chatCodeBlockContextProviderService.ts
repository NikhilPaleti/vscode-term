/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeBlockActionContextProvider, IChatCodeBlockContextProviderService } from '../../../../workbench/contrib/chat/browser/chatCodeBlockContext.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

/**
 * The accessible view injects this so chat's "copy code block" actions can act on
 * the block under the cursor. It only ever registers a provider for the chat
 * accessible views, which this window does not have, so a no-op satisfies it.
 *
 * The real implementation lives in `contrib/chat/browser/codeBlockContextProviderService.ts`,
 * registered by the chat contribution.
 */
class NullChatCodeBlockContextProviderService implements IChatCodeBlockContextProviderService {

	declare readonly _serviceBrand: undefined;

	readonly providers: ICodeBlockActionContextProvider[] = [];

	registerProvider(): IDisposable {
		return Disposable.None;
	}
}

registerSingleton(IChatCodeBlockContextProviderService, NullChatCodeBlockContextProviderService, InstantiationType.Delayed);
