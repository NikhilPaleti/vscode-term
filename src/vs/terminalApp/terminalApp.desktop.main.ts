/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


// #######################################################################
// ###                                                                 ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO TERMINALAPP.COMMON.MAIN.TS !!! ##
// ###                                                                 ###
// #######################################################################

//#region --- terminal window common

import './terminalApp.common.main.js';

//#endregion


//#region --- workbench (desktop main)

import '../workbench/electron-browser/desktop.contribution.js';

//#endregion


//#region --- workbench parts

import '../workbench/electron-browser/parts/dialogs/dialog.contribution.js';

//#endregion


//#region --- workbench services

import '../workbench/services/textfile/electron-browser/nativeTextFileService.js';
import '../workbench/services/dialogs/electron-browser/fileDialogService.js';
import '../workbench/services/workspaces/electron-browser/workspacesService.js';
import '../workbench/services/menubar/electron-browser/menubarService.js';
import '../workbench/services/update/electron-browser/updateService.js';
import '../workbench/services/url/electron-browser/urlService.js';
import '../workbench/services/lifecycle/electron-browser/lifecycleService.js';
import '../workbench/services/title/electron-browser/titleService.js';
import '../workbench/services/host/electron-browser/nativeHostService.js';
import '../platform/meteredConnection/electron-browser/meteredConnectionService.js';
import '../workbench/services/request/electron-browser/requestService.js';
import '../workbench/services/clipboard/electron-browser/clipboardService.js';
import '../workbench/services/contextmenu/electron-browser/contextmenuService.js';
import '../workbench/services/workspaces/electron-browser/workspaceEditingService.js';
import '../workbench/services/configurationResolver/electron-browser/configurationResolverService.js';
import '../workbench/services/accessibility/electron-browser/accessibilityService.js';
import '../workbench/services/keybinding/electron-browser/nativeKeyboardLayout.js';
import '../workbench/services/path/electron-browser/pathService.js';
import '../workbench/services/themes/electron-browser/nativeHostColorSchemeService.js';
import '../workbench/services/extensionManagement/electron-browser/extensionManagementService.js';
import '../workbench/services/mcp/electron-browser/mcpGalleryManifestService.js';
import '../workbench/services/mcp/electron-browser/mcpWorkbenchManagementService.js';
import '../workbench/services/encryption/electron-browser/encryptionService.js';
import '../workbench/services/imageResize/electron-browser/imageResizeService.js';
import '../workbench/services/localTranscription/electron-browser/localTranscriptionService.js';
import '../workbench/services/secrets/electron-browser/secretStorageService.js';
import '../workbench/services/localization/electron-browser/languagePackService.js';
import '../workbench/services/telemetry/electron-browser/telemetryService.js';
import '../platform/extensionResourceLoader/common/extensionResourceLoaderService.js';
import '../workbench/services/localization/electron-browser/localeService.js';
import '../workbench/services/extensions/electron-browser/extensionsScannerService.js';
import '../workbench/services/extensionManagement/electron-browser/extensionManagementServerService.js';
import '../workbench/services/extensionManagement/electron-browser/extensionGalleryManifestService.js';
import '../workbench/services/extensionManagement/electron-browser/extensionTipsService.js';
import '../workbench/services/userDataSync/electron-browser/userDataSyncService.js';
import '../workbench/services/userDataSync/electron-browser/userDataAutoSyncService.js';
import '../workbench/services/timer/electron-browser/timerService.js';
import '../workbench/services/environment/electron-browser/shellEnvironmentService.js';
import '../workbench/services/integrity/electron-browser/integrityService.js';
import '../workbench/services/workingCopy/electron-browser/workingCopyBackupService.js';
import '../workbench/services/checksum/electron-browser/checksumService.js';
import '../platform/remote/electron-browser/sharedProcessTunnelService.js';
import '../workbench/services/tunnel/electron-browser/tunnelService.js';
import '../platform/diagnostics/electron-browser/diagnosticsService.js';
import '../platform/profiling/electron-browser/profilingService.js';
import '../platform/telemetry/electron-browser/customEndpointTelemetryService.js';
import '../platform/remoteTunnel/electron-browser/remoteTunnelService.js';
import '../workbench/services/files/electron-browser/elevatedFileService.js';
import '../workbench/services/search/electron-browser/searchService.js';
import '../workbench/services/workingCopy/electron-browser/workingCopyHistoryService.js';
import '../workbench/services/userDataSync/browser/userDataSyncEnablementService.js';
// No extension host: see `services/extensions/browser/extensionService.ts` for why
// `nativeExtensionService` is not used here.
import './services/extensions/browser/extensionService.js';
import '../platform/userDataProfile/electron-browser/userDataProfileStorageService.js';
import '../workbench/services/auxiliaryWindow/electron-browser/auxiliaryWindowService.js';
import '../platform/extensionManagement/electron-browser/extensionsProfileScannerService.js';
import '../platform/sandbox/electron-browser/sandboxHelperService.js';
import '../platform/webContentExtractor/electron-browser/webContentExtractorService.js';
import '../workbench/services/agentHost/electron-browser/agentHostService.js';
import '../platform/agentHost/electron-browser/remoteAgentHostService.js';
import '../platform/agentHost/browser/agentHostEnablementService.js';
import '../workbench/services/browserView/electron-browser/playwrightWorkbenchService.js';
import '../workbench/services/process/electron-browser/processService.js';
import '../workbench/services/power/electron-browser/powerService.js';

import { registerSingleton } from '../platform/instantiation/common/extensions.js';
import { IUserDataInitializationService, UserDataInitializationService } from '../workbench/services/userData/browser/userDataInit.js';
import { SyncDescriptor } from '../platform/instantiation/common/descriptors.js';

registerSingleton(IUserDataInitializationService, new SyncDescriptor(UserDataInitializationService, [[]], true));


//#endregion


//#region --- workbench contributions

// Logs
import '../workbench/contrib/logs/electron-browser/logs.contribution.js';

// Localizations
import '../workbench/contrib/localization/electron-browser/localization.contribution.js';

// Explorer
import '../workbench/contrib/files/electron-browser/fileActions.contribution.js';


// Process Explorer
import '../workbench/contrib/processExplorer/electron-browser/processExplorer.contribution.js';


// Terminal
import '../workbench/contrib/terminal/electron-browser/terminal.contribution.js';

// Themes
import '../workbench/services/themes/electron-browser/themes.contribution.js';

// Performance
import '../workbench/contrib/performance/electron-browser/performance.contribution.js';


// Splash
import '../workbench/contrib/splash/electron-browser/splash.contribution.js';


// Encryption
import '../workbench/contrib/encryption/electron-browser/encryption.contribution.js';


// Keybindings Export
import '../workbench/contrib/keybindingsExport/electron-browser/keybindingsExport.contribution.js';

// System-wide (OS global) Keybindings
import '../workbench/contrib/keybindings/electron-browser/systemWideKeybindings.contribution.js';

//#endregion


// `Workbench`: only the contribution set above differs.
export { main } from '../workbench/electron-browser/desktop.main.js';
