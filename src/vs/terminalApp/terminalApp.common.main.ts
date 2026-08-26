/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


// #######################################################################
// ###                                                                 ###
// ### !!! This is the Terminal window equivalent of                   ###
// ### !!! `workbench.common.main.ts`. It deliberately loads a SUBSET  ###
// ### !!! of the workbench: see README.md for what is dropped and     ###
// ### !!! why. Adding an import here can silently pull a whole        ###
// ### !!! feature area back in -- run `npm run terminal-app-budget`.  ###
// ###                                                                 ###
// #######################################################################

//#region --- editor/workbench core

import '../editor/editor.all.js';

// NOTE: `api/browser/extensionHost.contribution.js` is deliberately NOT imported.
// It registers every `mainThread*` API implementation and therefore reaches chat,
// notebook, debug, scm, testing and comments -- the single largest dependency in
// the workbench. The Terminal window has no extension host, so the extension API
// is not needed. Extensions are still scanned (for declarative contributions such
// as color themes) but cannot activate.

import '../workbench/browser/workbench.contribution.js';
import '../workbench/browser/workbench.zenMode.contribution.js';

//#endregion


//#region --- workbench actions

import '../workbench/browser/actions/textInputActions.js';
import '../workbench/browser/actions/developerActions.js';
import '../workbench/browser/actions/helpActions.js';
import '../workbench/browser/actions/layoutActions.js';
import '../workbench/browser/actions/listCommands.js';
import '../workbench/browser/actions/navigationActions.js';
import '../workbench/browser/actions/windowActions.js';
import '../workbench/browser/actions/workspaceActions.js';
import '../workbench/browser/actions/workspaceCommands.js';
import '../workbench/browser/actions/quickAccessActions.js';
import '../workbench/browser/actions/widgetNavigationCommands.js';

//#endregion


//#region --- API Extension Points

// `viewsExtensionPoint` is dropped: it reaches every view-contributing feature.
import '../workbench/services/actions/common/menusExtensionPoint.js';
import '../workbench/api/common/configurationExtensionPoint.js';

//#endregion


//#region --- workbench parts

import '../workbench/browser/parts/editor/editor.contribution.js';
import '../workbench/browser/parts/editor/diffEditor.workbench.contribution.js';
import '../workbench/browser/parts/editor/editorParts.js';
import '../workbench/browser/parts/paneCompositePartService.js';
import '../workbench/browser/parts/banner/bannerPart.js';
import '../workbench/browser/parts/statusbar/statusbarPart.js';
import '../workbench/browser/parts/titlebar/menubar.contribution.js';

//#endregion


//#region --- workbench services

import '../platform/actions/common/actions.contribution.js';
import '../platform/undoRedo/common/undoRedoService.js';
import '../platform/mcp/common/mcpResourceScannerService.js';
import '../workbench/services/workspaces/common/editSessionIdentityService.js';
import '../workbench/services/workspaces/common/canonicalUriService.js';
import '../workbench/services/extensions/browser/extensionUrlHandler.js';
import '../workbench/services/keybinding/common/keybindingEditing.js';
import '../workbench/services/decorations/browser/decorationsService.js';
import '../workbench/services/dialogs/common/dialogService.js';
import '../workbench/services/progress/browser/progressService.js';
import '../workbench/services/editor/browser/codeEditorService.js';
import '../workbench/services/preferences/browser/preferencesService.js';
import '../workbench/services/configuration/common/jsonEditingService.js';
import '../workbench/services/textmodelResolver/common/textModelResolverService.js';
import '../workbench/services/editor/browser/editorService.js';
import '../workbench/services/editor/browser/editorResolverService.js';
import '../workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService.js';
import '../workbench/services/aiRelatedInformation/common/aiRelatedInformationService.js';
import '../workbench/services/aiSettingsSearch/common/aiSettingsSearchService.js';
import '../workbench/services/history/browser/historyService.js';
import '../workbench/services/activity/browser/activityService.js';
import '../workbench/services/keybinding/browser/keybindingService.js';
import '../workbench/services/untitled/common/untitledTextEditorService.js';
import '../workbench/services/textresourceProperties/common/textResourcePropertiesService.js';
import '../workbench/services/textfile/common/textEditorService.js';
import '../workbench/services/language/common/languageService.js';
import '../workbench/services/model/common/modelService.js';
import '../workbench/services/notebook/common/notebookDocumentService.js';
import '../workbench/services/commands/common/commandService.js';
import '../workbench/services/themes/browser/workbenchThemeService.js';
import '../workbench/services/label/common/labelService.js';
import '../workbench/services/extensions/common/extensionManifestPropertiesService.js';
import '../workbench/services/extensionManagement/common/extensionGalleryService.js';
import '../workbench/services/extensionManagement/browser/extensionEnablementService.js';
import '../workbench/services/extensionManagement/browser/builtinExtensionsScannerService.js';
import '../workbench/services/extensionRecommendations/common/extensionIgnoredRecommendationsService.js';
import '../workbench/services/extensionRecommendations/common/workspaceExtensionsConfig.js';
import '../workbench/services/extensionManagement/common/extensionFeaturesManagemetService.js';
import '../workbench/services/notification/common/notificationService.js';
import '../workbench/services/userDataSync/common/userDataSyncUtil.js';
import '../workbench/services/userDataProfile/browser/userDataProfileImportExportService.js';
import '../workbench/services/userDataProfile/browser/userDataProfileManagement.js';
import '../workbench/services/userDataProfile/common/remoteUserDataProfiles.js';
import '../workbench/services/remote/common/remoteExplorerService.js';
import '../workbench/services/remote/common/remoteExtensionsScanner.js';
import '../workbench/services/terminal/common/embedderTerminalService.js';
import '../workbench/services/workingCopy/common/workingCopyService.js';
import '../workbench/services/workingCopy/common/workingCopyFileService.js';
import '../workbench/services/workingCopy/common/workingCopyEditorService.js';
import '../workbench/services/filesConfiguration/common/filesConfigurationService.js';
import '../workbench/services/views/browser/viewDescriptorService.js';
import '../workbench/services/views/browser/viewsService.js';
import '../workbench/services/quickinput/browser/quickInputService.js';
import '../workbench/services/userDataSync/browser/userDataSyncWorkbenchService.js';
import '../workbench/services/authentication/browser/authenticationService.js';
import '../workbench/services/authentication/browser/authenticationExtensionsService.js';
import '../workbench/services/authentication/browser/authenticationUsageService.js';
import '../workbench/services/authentication/browser/authenticationAccessService.js';
import '../workbench/services/authentication/browser/authenticationMcpUsageService.js';
import '../workbench/services/authentication/browser/authenticationMcpAccessService.js';
import '../workbench/services/authentication/browser/authenticationMcpService.js';
import '../workbench/services/authentication/browser/dynamicAuthenticationProviderStorageService.js';
import '../workbench/services/authentication/browser/authenticationQueryService.js';
import '../platform/hover/browser/hoverService.js';
import '../platform/userInteraction/browser/userInteractionServiceImpl.js';
import '../workbench/services/assignment/common/assignmentService.js';
import '../workbench/services/outline/browser/outlineService.js';
import '../workbench/services/languageDetection/browser/languageDetectionWorkerServiceImpl.js';
import '../editor/common/services/languageFeaturesService.js';
import '../editor/common/services/semanticTokensStylingService.js';
import '../editor/common/services/treeViewsDndService.js';
// No TextMate: grammars only ever arrive from extensions, and nothing else
// injects ITextMateTokenizationService. Editor tokenization uses tree-sitter.
import '../workbench/services/treeSitter/browser/treeSitter.contribution.js';
import '../workbench/services/userActivity/common/userActivityService.js';
import '../workbench/services/userActivity/browser/userActivityBrowser.js';
import '../workbench/services/userAttention/browser/userAttentionBrowser.js';
import '../workbench/services/editor/browser/editorPaneService.js';
import '../workbench/services/editor/common/customEditorLabelService.js';
import '../workbench/services/dataChannel/browser/dataChannelService.js';
import '../workbench/services/inlineCompletions/common/inlineCompletionsUnification.js';
import '../workbench/services/chat/common/chatEntitlementService.js';
// NOTE: the agent host services are deliberately NOT registered.
//
// The agent host is a separate node process that runs coding agents, serves them
// over a MessagePort and WebSocket server, and publishes a discoverable socket
// Nothing in terminal-only window can drive it.
//
// Agents running *inside* terminal (Claude Code, Copilot CLI, ...) are unaffected.
import '../workbench/services/log/common/defaultLogLevels.js';

import { InstantiationType, registerSingleton } from '../platform/instantiation/common/extensions.js';
import { GlobalExtensionEnablementService } from '../platform/extensionManagement/common/extensionEnablementService.js';
import { IAllowedExtensionsService, IGlobalExtensionEnablementService } from '../platform/extensionManagement/common/extensionManagement.js';
import { ContextViewService } from '../platform/contextview/browser/contextViewService.js';
import { IContextViewService } from '../platform/contextview/browser/contextView.js';
import { IListService, ListService } from '../platform/list/browser/listService.js';
import { MarkerDecorationsService } from '../editor/common/services/markerDecorationsService.js';
import { IMarkerDecorationsService } from '../editor/common/services/markerDecorations.js';
import { IMarkerService } from '../platform/markers/common/markers.js';
import { MarkerService } from '../platform/markers/common/markerService.js';
import { ContextKeyService } from '../platform/contextkey/browser/contextKeyService.js';
import { IContextKeyService } from '../platform/contextkey/common/contextkey.js';
import { ITextResourceConfigurationService } from '../editor/common/services/textResourceConfiguration.js';
import { TextResourceConfigurationService } from '../editor/common/services/textResourceConfigurationService.js';
import { IDownloadService } from '../platform/download/common/download.js';
import { DownloadService } from '../platform/download/common/downloadService.js';
import { OpenerService } from '../editor/browser/services/openerService.js';
import { IOpenerService } from '../platform/opener/common/opener.js';
import { IgnoredExtensionsManagementService, IIgnoredExtensionsManagementService } from '../platform/userDataSync/common/ignoredExtensions.js';
import { ExtensionStorageService, IExtensionStorageService } from '../platform/extensionManagement/common/extensionStorage.js';
import { IUserDataSyncLogService } from '../platform/userDataSync/common/userDataSync.js';
import { UserDataSyncLogService } from '../platform/userDataSync/common/userDataSyncLog.js';
import { AllowedExtensionsService } from '../platform/extensionManagement/common/allowedExtensionsService.js';
import { IAllowedMcpServersService, IMcpGalleryService } from '../platform/mcp/common/mcpManagement.js';
import { McpGalleryService } from '../platform/mcp/common/mcpGalleryService.js';
import { AllowedMcpServersService } from '../platform/mcp/common/allowedMcpServersService.js';
import { IWebWorkerService } from '../platform/webWorker/browser/webWorkerService.js';
import { WebWorkerService } from '../platform/webWorker/browser/webWorkerServiceImpl.js';

registerSingleton(IUserDataSyncLogService, UserDataSyncLogService, InstantiationType.Delayed);
registerSingleton(IAllowedExtensionsService, AllowedExtensionsService, InstantiationType.Delayed);
registerSingleton(IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService, InstantiationType.Delayed);
registerSingleton(IGlobalExtensionEnablementService, GlobalExtensionEnablementService, InstantiationType.Delayed);
registerSingleton(IExtensionStorageService, ExtensionStorageService, InstantiationType.Delayed);
registerSingleton(IContextViewService, ContextViewService, InstantiationType.Delayed);
registerSingleton(IListService, ListService, InstantiationType.Delayed);
registerSingleton(IMarkerDecorationsService, MarkerDecorationsService, InstantiationType.Delayed);
registerSingleton(IMarkerService, MarkerService, InstantiationType.Delayed);
registerSingleton(IContextKeyService, ContextKeyService, InstantiationType.Delayed);
registerSingleton(ITextResourceConfigurationService, TextResourceConfigurationService, InstantiationType.Delayed);
registerSingleton(IDownloadService, DownloadService, InstantiationType.Delayed);
registerSingleton(IOpenerService, OpenerService, InstantiationType.Delayed);
registerSingleton(IWebWorkerService, WebWorkerService, InstantiationType.Delayed);
registerSingleton(IMcpGalleryService, McpGalleryService, InstantiationType.Delayed);
registerSingleton(IAllowedMcpServersService, AllowedMcpServersService, InstantiationType.Delayed);

//#endregion

//#region --- workbench contributions

// Default Account / policies
import '../workbench/services/accounts/browser/defaultAccount.js';
import '../workbench/services/policies/browser/accountPolicyGate.contribution.js';
import '../workbench/services/policies/browser/policyTelemetry.contribution.js';

// Settings and keybindings editors
import '../workbench/contrib/preferences/browser/preferences.contribution.js';
import '../workbench/contrib/preferences/browser/keybindingsEditorContribution.js';
import '../workbench/contrib/preferences/browser/preferencesSearch.js';

// Logs and Output
import '../workbench/contrib/logs/common/logs.contribution.js';
import '../workbench/contrib/output/browser/output.contribution.js';
import '../workbench/contrib/output/browser/outputView.js';

// Text file editing -- needed to open settings.json / keybindings.json. The
// Explorer viewlet itself is not imported.
import '../workbench/contrib/files/browser/files.contribution.js';
import '../workbench/contrib/files/browser/fileActions.contribution.js';

// Editor / workbench chrome
import '../workbench/contrib/sash/browser/sash.contribution.js';
import '../workbench/contrib/list/browser/list.contribution.js';
import '../workbench/contrib/folding/browser/folding.contribution.js';
import '../workbench/contrib/themes/browser/themes.contribution.js';
import '../workbench/contrib/modernUI/browser/modernUI.contribution.js';

// Commands, keybindings, URLs, openers
import '../workbench/contrib/commands/common/commands.contribution.js';
import '../workbench/contrib/keybindings/browser/keybindings.contribution.js';
import '../workbench/contrib/url/browser/url.contribution.js';
import '../workbench/contrib/externalUriOpener/common/externalUriOpener.contribution.js';
import '../workbench/contrib/opener/browser/opener.contribution.js';

// Misc
import '../workbench/contrib/relauncher/browser/relauncher.contribution.js';
import '../workbench/contrib/processExplorer/browser/processExplorer.contribution.js';

// Accessibility signals. Registered here instead of importing
// `contrib/accessibilitySignals/browser/accessibilitySignal.contribution.js`,
// which also registers debug-specific contributions and therefore reaches
// `contrib/debug`. The terminal injects `IAccessibilitySignalService` (terminal
// bell, command failure signals), so the service itself must exist.
import './services/accessibilitySignal/browser/accessibilitySignalService.js';

// Services whose only registration in the workbench lives in a contribution this
// window does not load, but which surviving code still injects. Each of these is
// the service module on its own, without the feature's UI: dropping the
// registration instead would throw "depends on UNKNOWN service" at runtime.
// `npm run terminal-app-di-check` guards this.
import '../workbench/contrib/snippets/browser/snippets.service.contribution.js';
import '../workbench/contrib/inlineCompletions/browser/renameSymbolTrackerService.js';
import '../workbench/contrib/speech/browser/speech.contribution.js';
import './services/extensions/browser/extensionsWorkbenchService.js';
import './services/bulkEdit/browser/bulkEditService.js';
import './services/accessibility/browser/accessibleViewService.js';
import './services/accessibility/browser/chatCodeBlockContextProviderService.js';
import './services/terminal/browser/terminalChatService.js';

//#endregion


//#region --- terminal

// The terminal's own aggregate entry point (`contrib/terminal/terminal.all.js`)
// is NOT used: it imports the chat, chat-agent-tools and voice terminal
// contributions. Everything else it lists is imported explicitly below.

import '../workbench/contrib/terminal/browser/terminal.contribution.js';
import '../workbench/contrib/terminal/common/environmentVariable.contribution.js';
import '../workbench/contrib/terminal/common/terminalExtensionPoints.contribution.js';
import '../workbench/contrib/terminal/browser/terminalView.js';

import '../workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution.js';
import '../workbench/contrib/terminalContrib/autoReplies/browser/terminal.autoReplies.contribution.js';
import '../workbench/contrib/terminalContrib/commandGuide/browser/terminal.commandGuide.contribution.js';
import '../workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution.js';
import '../workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution.js';
import '../workbench/contrib/terminalContrib/find/browser/terminal.find.contribution.js';
import '../workbench/contrib/terminalContrib/history/browser/terminal.history.contribution.js';
import '../workbench/contrib/terminalContrib/links/browser/terminal.links.contribution.js';
import '../workbench/contrib/terminalContrib/notification/browser/terminal.notification.contribution.js';
import '../workbench/contrib/terminalContrib/quickAccess/browser/terminal.quickAccess.contribution.js';
import '../workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution.js';
import '../workbench/contrib/terminalContrib/resizeDimensionsOverlay/browser/terminal.resizeDimensionsOverlay.contribution.js';
import '../workbench/contrib/terminalContrib/sendSequence/browser/terminal.sendSequence.contribution.js';
import '../workbench/contrib/terminalContrib/sendSignal/browser/terminal.sendSignal.contribution.js';
import '../workbench/contrib/terminalContrib/stickyScroll/browser/terminal.stickyScroll.contribution.js';
import '../workbench/contrib/terminalContrib/suggest/browser/terminal.suggest.contribution.js';
import '../workbench/contrib/terminalContrib/telemetry/browser/terminal.telemetry.contribution.js';
import '../workbench/contrib/terminalContrib/typeAhead/browser/terminal.typeAhead.contribution.js';
import '../workbench/contrib/terminalContrib/zoom/browser/terminal.zoom.contribution.js';

//#endregion


//#region --- terminal window contributions

import './contrib/configuration/browser/configuration.contribution.js';
import './contrib/startup/browser/terminalAppStartup.contribution.js';

//#endregion
