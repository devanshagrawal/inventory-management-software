# Prebuilt native binaries

`better-sqlite3` is a native Node addon and must be compiled against
Electron's own Node ABI (not the system Node's), separately per
platform/arch. The `.node` files in this directory are those
Electron-ABI builds, produced by `node electron/rebuild-native.mjs`
and copied into the packaged app by `electron/copy-assets.mjs`.

They're committed (unlike `dist/` or `node_modules/`) because they're
slow to reproduce and platform-specific — anyone packaging the app on
a machine that already has the right binary here doesn't need to
rebuild it. The Windows binary is produced by the GitHub Actions
workflow (`.github/workflows/build-windows.yml`) rather than committed
here, since it can't be built on macOS.
