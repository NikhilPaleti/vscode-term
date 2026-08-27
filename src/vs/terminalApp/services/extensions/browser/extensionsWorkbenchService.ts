/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IExtensionsWorkbenchService } from '../../../../workbench/contrib/extensions/common/extensions.js';
import { ExtensionsWorkbenchService } from '../../../../workbench/contrib/extensions/browser/extensionsWorkbenchService.js';

// The workbench registers this in `contrib/extensions/browser/extensions.contribution.ts`
// alongside the whole Extensions viewlet, which this window does not load. The
// service itself is still injected by the settings editor, the keybindings
// editor, the theme picker and the localization contribution, so register just
// the service.
//
// Registered `Delayed` rather than the workbench's `Eager`: eager registration
// exists to drive extension auto-updates, and nothing here can be updated: the
// only extensions in this window are the built-in themes shipped inside the app.
registerSingleton(IExtensionsWorkbenchService, ExtensionsWorkbenchService, InstantiationType.Delayed);
