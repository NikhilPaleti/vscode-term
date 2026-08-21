/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Extensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ActivityBarPosition } from '../../../../workbench/services/layout/browser/layoutService.js';
import { TerminalLocationConfigValue, TerminalSettingId } from '../../../../platform/terminal/common/terminal.js';

// Default values that differ for the Terminal window. Everything here is still a
// normal setting the user can override in `settings.json`; only the default
// changes.
//
// Part *visibility* (side bar, panel, secondary side bar) is workbench state
// rather than configuration, so it is applied in
// `contrib/startup/browser/terminalAppStartup.contribution.ts` instead.
Registry.as<IConfigurationRegistry>(Extensions.Configuration).registerDefaultConfigurations([{
	overrides: {
		// Terminals are editors here: that is what gives tabs, splits, drag and
		// drop between groups, and "Move into New Window".
		[TerminalSettingId.DefaultLocation]: TerminalLocationConfigValue.Editor,

		// Chrome this window has no use for.
		'workbench.activityBar.location': ActivityBarPosition.HIDDEN,
		'workbench.layoutControl.enabled': false,
		'window.commandCenter': false,
		'workbench.startupEditor': 'none',
		'workbench.tips.enabled': false,

		// There is no update server for this build and the update contribution is
		// not loaded.
		'update.mode': 'none',
	},
	donotCache: true,
	preventExperimentOverride: true,
	source: 'terminalAppDefaults'
}]);
