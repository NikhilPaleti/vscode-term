/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AccessibilitySignalService, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

// The workbench registers this service in
// `contrib/accessibilitySignals/browser/accessibilitySignal.contribution.ts`,
// which also registers debug-specific contributions and therefore depends on
// `contrib/debug`. The terminal needs the service (bell, command failure
// signals) but not the debug contributions, so it is registered on its own here.
registerSingleton(IAccessibilitySignalService, AccessibilitySignalService, InstantiationType.Delayed);
