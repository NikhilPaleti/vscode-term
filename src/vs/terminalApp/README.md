# Terminal window

`vs/terminalApp` implements the Terminal window: a terminal-only application
built on the same platform layers as the workbench. It is the only window this
build ships.

## What it is

The experience being reproduced is VS Code's "Terminal: Move Into New Window"
([`terminalService.moveIntoNewEditor`](../workbench/contrib/terminal/browser/terminalService.ts)),
which is an `EditorPart` hosting terminal editors plus a title bar and status
bar, and nothing else. Terminal *editors* — rather than the terminal panel view —
are what provide tabs, splits, drag and drop between groups, and further
"move into new window".

So this layer does not implement a new layout. It reuses
[`vs/workbench/browser/workbench.ts`](../workbench/browser/workbench.ts) and its
`Layout` unchanged, reuses the standard desktop bootstrap
([`desktop.main.ts`](../workbench/electron-browser/desktop.main.ts)), and only
changes:

| Concern | Where |
| --- | --- |
| Which contributions load | [`terminalApp.common.main.ts`](terminalApp.common.main.ts), [`terminalApp.desktop.main.ts`](terminalApp.desktop.main.ts) |
| Window bootstrap and HTML | [`electron-browser/`](electron-browser/) |
| Services replaced for this window | [`services/`](services/) |
| Default settings | [`contrib/configuration/browser/configuration.contribution.ts`](contrib/configuration/browser/configuration.contribution.ts) |
| Hiding empty parts, opening a terminal on start | [`contrib/startup/browser/terminalAppStartup.contribution.ts`](contrib/startup/browser/terminalAppStartup.contribution.ts) |

Contrast with `vs/sessions`, which needed a bespoke `Workbench` subclass because
its layout genuinely differs.

## What is not loaded

Chat, notebooks, debug, testing, source control, search, the Explorer viewlet,
the Extensions viewlet, welcome/walkthroughs, MCP, tasks, remote, and webviews.

The largest single omission is
[`api/browser/extensionHost.contribution.ts`](../workbench/api/browser/extensionHost.contribution.ts).
It registers every `mainThread*` API implementation and therefore reaches chat,
notebook, debug, scm, testing and comments — keeping it would keep essentially
all of the workbench.

Dropping it means there can be no extension host, so `IExtensionService` is
registered as `NullExtensionService`
([`services/extensions/browser/extensionService.ts`](services/extensions/browser/extensionService.ts)).
That is load-bearing rather than cosmetic: `NativeExtensionHostFactory`
unconditionally creates a local-process extension host, so keeping the real
service would spawn a host that then fails for want of the main-thread API. With
the null service, `vs/workbench/api/node/extensionHostProcess` is not built
either. No extension is scanned, activated, or contributes anything — including
the `theme-defaults` built-in, so UI and ANSI colors come from the defaults
declared in the color registry.

Monaco (`editor.all.js`) **is** loaded: it backs the settings and keybindings
editors, and `settings.json` / `keybindings.json` editing. Without the JSON
language extension there is no JSON validation or IntelliSense in those files —
the graphical settings editor is the intended path.

The terminal itself is imported feature by feature rather than through
`contrib/terminal/terminal.all.ts`, which pulls in the chat, chat-agent-tools and
voice terminal contributions.

## Services this window has to provide itself

Dropping a contribution also drops the `registerSingleton` calls it happened to
own, which the compiler and the dependency budget cannot see: surviving code that
injects such a service fails at runtime with "depends on UNKNOWN service". Some
of those services are therefore registered here, in [`services/`](services/),
without the feature UI they normally come with:

| Service | Normally registered by | Here |
| --- | --- | --- |
| `IExtensionService` | `nativeExtensionService` | `NullExtensionService`, so no extension host is spawned |
| `IAccessibilitySignalService` | the accessibility-signals contribution (reaches debug) | the service alone |
| `IAccessibleViewService` | the accessibility contribution (reaches chat, notebook, debug) | the service alone, so the terminal accessible view still works |
| `IExtensionsWorkbenchService` | the Extensions viewlet | the service alone, for the settings and keybindings editors |
| `IBulkEditService` | `contrib/bulkEdit` (reaches notebook) | a text-only implementation |
| `ITerminalChatService` | `terminalContrib/chat` (injects `IChatService`) | a no-op: every terminal here is user-created |
| `IChatCodeBlockContextProviderService` | the chat contribution | a no-op, for the accessible view |

`npm run terminal-app-di-check` walks the graph, collects what is registered
against what is injected, and fails on the difference. It resolves decorators to
service **ids**, since `refineServiceDecorator` means several decorator names can
share one id. It carries a small allowlist of ids that are legitimately absent --
provided scoped per editor group, or registered in the shared process where their
consumers actually run -- each with the reason.

## The dependency budget

`npm run terminal-app-budget` walks the module graph from
`terminalApp.desktop.main.ts` and fails if a forbidden feature area becomes
reachable or an import does not resolve. Run it after changing any import in this
directory.

The window is small only because a few specific edges are cut. One import can
undo that, which is what the guard is for. The cuts, all made in `vs/workbench`
so the workbench keeps the features:

| Edge | How it was cut |
| --- | --- |
| `terminal/browser/xterm/decorationAddon.ts` → chat (956 modules) | "Attach To Chat" moved behind [`TerminalCommandDecorationActions`](../workbench/contrib/terminal/browser/terminalDecorationActions.ts); the chat side now lives in [`terminalContrib/chat/browser/terminalAttachToChat.ts`](../workbench/contrib/terminalContrib/chat/browser/terminalAttachToChat.ts) |
| `terminalContrib/find` → `search/browser/searchActionsBase.ts` | Routed through `ICommandService` and the leaf `SearchCommandIds` constant |
| `terminal/browser/terminalMenus.ts` and `terminalContrib/accessibility` → `chat/common/actions/chatContextKeys.ts` (511 modules) | Shared `TerminalDictationAvailable` expression in [`terminal/common/terminalContextKey.ts`](../workbench/contrib/terminal/common/terminalContextKey.ts), referencing the chat keys by name |
| `contrib/accessibilitySignals` → `contrib/debug` | `IAccessibilitySignalService` registered directly in [`services/accessibilitySignal/browser/accessibilitySignalService.ts`](services/accessibilitySignal/browser/accessibilitySignalService.ts) instead of importing the workbench contribution, which also registers debug contributions |

## Running it

```sh
npm install                 # requires the Node version in .nvmrc
npm run watch               # or: npm run build-fast
./scripts/code.sh           # loads terminalApp-dev.html
npm run gulp vscode-darwin-arm64   # produces "<product.nameLong>.app"
```

The window is chosen unconditionally in
[`windowImpl.ts`](../platform/windows/electron-main/windowImpl.ts); there is no
flag to get the workbench back, because it is not built.

## Known further trims

- `contrib/preferences` (the settings and keybindings editors) is the largest
  remaining contribution and reaches modules inside `contrib/extensions` and
  `contrib/mcp` for the extension and MCP sections of the settings editor. Those
  areas are therefore not in the forbidden list.
- The extension-host and notebook *web workers* are still built for the desktop
  target. They are shared with the web and server targets in
  `build/next/index.ts`, so removing them means splitting `workerEntryPoints`
  per target. Nothing requests them at runtime; this is disk size only.
- The `--agents` CLI flag and the `isSessionsWindow` plumbing are left in place
  to keep the diff against upstream small. `isSessionsWindow` no longer selects a
  different window, so `--agents` just opens another Terminal window.

## Structural boundaries

- `vs/terminalApp` may import from `vs/workbench` and lower layers.
  `vs/workbench` must not import from `vs/terminalApp`.
- Contributions must be imported by `terminalApp.common.main.ts` (shared) or
  `terminalApp.desktop.main.ts` (desktop-only) to load.
