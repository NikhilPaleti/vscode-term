/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IExtensionService, NullExtensionService } from '../../../../workbench/services/extensions/common/extensions.js';

// The Terminal window runs no extensions, so it registers a no-op
// `IExtensionService` rather than the workbench's `NativeExtensionService`.
//
// This is not only about the contribution set: `NativeExtensionHostFactory`
// unconditionally creates a `NativeLocalProcessExtensionHost` for the local
// process, so keeping the real service would spawn an extension host process at
// startup. That host would then fail, because the `mainThread*` API
// implementations live in `api/browser/extensionHost.contribution.ts`, which this
// window deliberately does not load (it reaches chat, notebook, debug, scm,
// testing and comments).
//
// Consequences, all intended:
// - no extension is scanned, activated, or contributes anything;
// - the terminal's own features are unaffected: they are all core, including
//   shell integration, profile detection, links, and suggestions;
// - contributed terminal profiles are unavailable; detected profiles (zsh, bash,
//   fish, pwsh, ...) come from the pty host and still work;
// - color themes contributed by the `theme-defaults` built-in extension do not
//   register, so the UI and ANSI palette come from the defaults declared in the
//   color registry.
registerSingleton(IExtensionService, NullExtensionService, InstantiationType.Delayed);
