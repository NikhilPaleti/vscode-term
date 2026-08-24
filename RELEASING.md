# Releasing VSC Term

How to build, package and install this fork, and what to keep an eye on over time.

This repo builds one desktop application: the Terminal window
([`src/vs/terminalApp`](src/vs/terminalApp/README.md)). The VS Code workbench and
the Agents window are not built.

Current identity, from [`product.json`](product.json):

| Field | Value |
| --- | --- |
| `nameLong` (macOS bundle, installer display name) | `Visual Studio Code - Minimal Terminal` |
| `nameShort` (executable) | `VSC Term` |
| `applicationName` (CLI, Linux package) | `vsc-terminal` |
| `dataFolderName` | `.vsc-terminal` |
| `darwinBundleIdentifier` | `com.vscterminal.app` |
| `quality` | `None` |

## Prerequisites

- **Node 24.18.0** (see [`.nvmrc`](.nvmrc)). Anything older fails: the build runs
  TypeScript directly via `node --experimental-strip-types`. With `mise` this is
  automatic in the repo directory; otherwise `nvm use`.
- `npm install` at the repo root.
- **You must build on the OS you are targeting.** Packaging copies the native
  modules out of your local `node_modules` (`node-pty`, `spdlog`, `sqlite3`,
  `native-keymap`), so a Linux build produced on macOS ships macOS binaries and
  will not start. There is no cross-OS build.
- Cross-*architecture* on the same OS does work, the way upstream CI does it:
  reinstall with the target arch first, e.g. `npm_config_arch=x64 npm ci`, then
  build the matching target.

Artifacts land in a **sibling directory of the repo**, e.g. `../VSCode-darwin-arm64/`.

---

## 1. Building a release per OS

Every target has a plain task and a `-min` task. **Use `-min` for releases** — it
is the minified build. The plain variant exists for debugging.

### macOS

```sh
npm run gulp vscode-darwin-arm64-min       # Apple silicon
npm run gulp vscode-darwin-x64-min         # Intel
```

Produces `../VSCode-darwin-arm64/Visual Studio Code - Minimal Terminal.app`.

### Windows

```sh
npm run gulp vscode-win32-x64-min       # For x86
npm run gulp vscode-win32-arm64-min     # For ARM
```

Produces `../VSCode-win32-x64/` containing `VSC Term.exe` — a portable build that
runs as-is. For an installer, see below.

### Linux

```sh
npm run gulp vscode-linux-x64-min          # or -arm64-min, -armhf-min
```

Produces `../VSCode-linux-x64/` containing `vsc-terminal`. For distro packages,
see below.

---

## 2. Installers

### macOS — no installer needed

Drag the `.app` into `/Applications`. There is no `dmg` task in this codebase.
To hand it to another machine, zip it yourself:

```sh
cd ../VSCode-darwin-arm64
ditto -c -k --keepParent "Visual Studio Code - Minimal Terminal.app" vsc-term-macos-arm64.zip
```

Use `ditto` rather than `zip` — it preserves the bundle's symlinks and metadata.

**Gatekeeper.** The app is unsigned. Built locally it launches normally, because
nothing marks it as quarantined. Once it has been downloaded or transferred it
will be blocked, and the fix is one of:

```sh
xattr -dr com.apple.quarantine "/Applications/Visual Studio Code - Minimal Terminal.app"
```

or right-click the app → **Open** → confirm once. Distributing it properly needs
an Apple Developer ID for codesigning and notarization, which this build does not
do.

### Windows — Inno Setup installer

Build the app first, then:

```sh
npm run gulp vscode-win32-x64-system-setup   # installs for all users
npm run gulp vscode-win32-x64-user-setup     # installs per user, no admin needed
```

Output: `.build/win32-x64/system-setup/VSCodeSetup.exe` (or `user-setup/`).

No separate Inno Setup install is required — `ISCC.exe` ships inside the
`innosetup` npm package. It is a Windows executable, so this task only runs on
Windows.

Two things worth knowing:

- The installer filename is hardcoded to `VSCodeSetup.exe` in
  [`build/win32/code.iss`](build/win32/code.iss) (`OutputBaseFilename`). Rename
  the artifact, or change that line, if the name matters to you.
- The **"register as an editor for supported file types"** checkbox is deliberately
  off by default in this fork. Upstream has it on, which would register the app as
  an *Open with* handler for 142 source extensions — wrong for a terminal. The
  *folder* context-menu option ("Open in VSC Term") is the useful one and remains
  available, opt-in.

The portable `../VSCode-win32-x64/` directory is a perfectly good alternative if
you would rather not install at all — just run `VSC Term.exe`.

### Linux — deb / rpm / snap

Build the app first, then one of:

```sh
npm run gulp vscode-linux-x64-build-deb
npm run gulp vscode-linux-x64-build-rpm
npm run gulp vscode-linux-x64-build-snap
```

Artifacts:

| Package | Path |
| --- | --- |
| deb | `.build/linux/deb/amd64/deb/*.deb` |
| rpm | `.build/linux/rpm/x86_64/rpmbuild/RPMS/x86_64/*.rpm` |
| snap | `.build/linux/snap/x64/` |

Host tooling required, per format: `fakeroot` + `dpkg-deb`, `rpmbuild`, or
`snapcraft`. Install:

```sh
sudo apt install ./vsc-terminal_*_amd64.deb      # or: sudo dpkg -i
sudo dnf install ./vsc-terminal-*.rpm            # or: sudo rpm -i
```

This registers `vsc-terminal` on `PATH`, installs the desktop entry under
`System;TerminalEmulator;Utility`, and offers **Open in terminal** for folders via
`inode/directory`.

Unlike upstream, this package deliberately does **not** add Microsoft's apt
repository or signing key, and does not register itself in the `editor`
alternatives system. See [`resources/linux/debian/`](resources/linux/debian/).

The plain `../VSCode-linux-x64/` directory also works standalone — run
`./vsc-terminal`. Tar it up for a portable release.

### Versioning

Releases inherit upstream's version from [`package.json`](package.json) (currently
`1.136.0`), so it tracks whichever VS Code you last merged. If you want release
numbers of your own, that field is the place, but note it feeds the Windows
installer and the deb/rpm version strings.

---

## 3. Maintenance

### Merging upstream

`main` carries the product, so it has permanently diverged from upstream. Do not
use GitHub's "Sync fork" button: it offers a *Discard commits* option next to the
one you want. Merge locally instead.

```sh
git fetch upstream
git merge upstream/main
```

**Merge, never rebase.** Rebasing rewrites every product commit on each
integration, replays the same `buildfile.ts` / `product.json` / `package.json`
conflicts once per commit, and needs a force-push.

> ⚠️ This repo currently has `pull.rebase = merges` set locally, which means a bare
> `git pull` **still rebases** (preserving merge commits). That is what rewrote the
> product commits once already. Either fix it:
>
> ```sh
> git config pull.rebase false
> ```
>
> or keep using the explicit two-step `fetch` + `merge` above and never `git pull`
> in this repo.

The `upstream` remote is configured to fetch **only** `main`:

```ini
remote.upstream.fetch = +refs/heads/main:refs/remotes/upstream/main
```

Leave it that way. The default `+refs/heads/*` pulls ~4900 branches from every
VS Code developer, costing hundreds of MB. For the same reason, avoid
`git fetch --all`, and do not re-add a second wide-open remote pointing at
microsoft/vscode.

### After every upstream merge

Run these three, in order:

```sh
npm run typecheck-client
npm run terminal-app-di-check
npm run terminal-app-budget
```

They cover the two ways upstream silently breaks this fork:

- **`terminal-app-di-check`** — upstream adds a service injection to code we keep,
  whose registration lives in a contribution we dropped. This surfaces at runtime
  as `depends on UNKNOWN service` and is invisible to the compiler.
- **`terminal-app-budget`** — upstream adds an import that re-couples the terminal
  to chat, notebook, debug and friends, quietly undoing the size work.

**Then check one thing by hand**, because no guard covers it: a text merge can
re-add entries to the entry-point lists we trimmed. Skim the merge diff for
`build/buildfile.ts` and `build/next/index.ts`.

Conflicts are likeliest in `build/buildfile.ts`, `build/gulpfile.vscode.ts`,
`build/next/index.ts`, `product.json`, `package.json`, `eslint.config.js`, and the
handful of core terminal/chat/accessibility files this fork patches. Resolve them
locally, never in the GitHub web editor — it cannot run any of the checks above.

### After changing product.json names

Re-run:

```sh
npm run electron
```

`.build/electron/` is named from `nameLong`/`nameShort`, and `scripts/code.sh`
derives its launch path the same way. Skip this and the dev launch fails with a
missing-file error.

### Housekeeping

- **Disk.** `extensions/*/node_modules` is ~3 GB (of which `extensions/copilot` is
  ~1.4 GB) and no extension can activate in this app, so it is dead weight for
  day-to-day work. `rm -rf extensions/*/node_modules` reclaims it; `npm install`
  restores it. Only needed if you build extensions or run full packaging.
- **Git objects.** After dropping many refs, `git reflog expire --expire=now --all`
  followed by `git gc --prune=now` is what actually reclaims space — deleting refs
  alone frees nothing.

### Known gaps

- **Icons are still upstream's artwork**: `resources/darwin/code.icns`,
  `resources/win32/code.ico`, `resources/linux/code.png` (plus
  `resources/linux/rpm/code.xpm`). Filenames and identity are correct; only the
  images need replacing.
- **Windows and Linux builds have never been produced.** Everything about them
  here is derived from the build scripts, not from a completed run. macOS is the
  only path exercised so far, and only via the dev launch — **the full gulp
  packaging task has not been run on any platform**. Expect the first run of it to
  need fixing; the most likely spot is the checksum list in
  [`build/gulpfile.vscode.ts`](build/gulpfile.vscode.ts), which throws if a listed
  file is missing.
- Run `desktop-file-validate` on `resources/linux/*.desktop` the first time you
  build on Linux. The tool does not exist on macOS, so those files have only been
  reviewed by inspection.
- **Still shipping dead payload.** The build compiles and packages the built-in
  extensions (~379 MB of source, 255 MB of it `extensions/copilot`) plus three
  downloaded `builtInExtensions`, none of which can activate under
  `NullExtensionService`. Removing them from packaging is the single largest export
  win still available. Roughly 164 MB of unused npm production dependencies can go
  too, along with the `remoteTunnel` and `sandboxHelper` service registrations.

