/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { AccessibleViewService } from '../../../../workbench/contrib/accessibility/browser/accessibleView.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

// The workbench registers this in `contrib/accessibility/browser/accessibility.contribution.ts`
// together with the accessible views for chat, notebooks, debug and comments,
// which this window does not load. The terminal's own accessible view -- the
// screen-reader-friendly view of the buffer, and the accessibility help dialog --
// needs the service, so register just the service.
registerSingleton(IAccessibleViewService, AccessibleViewService, InstantiationType.Delayed);
