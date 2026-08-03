// Next.js's standalone output doesn't include static assets — this is a
// documented requirement, not an oversight. Run after `next build`.
import { cpSync, existsSync, copyFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(root, "..")

const copies = [
  [
    path.join(projectRoot, "public"),
    path.join(projectRoot, ".next/standalone/public"),
  ],
  [
    path.join(projectRoot, ".next/static"),
    path.join(projectRoot, ".next/standalone/.next/static"),
  ],
  [
    path.join(projectRoot, "prisma/migrations"),
    path.join(projectRoot, ".next/standalone/migrations"),
  ],
  [
    path.join(root, "migrate.mjs"),
    path.join(projectRoot, ".next/standalone/migrate.mjs"),
  ],
]

for (const [src, dest] of copies) {
  if (!existsSync(src)) {
    console.error(`Missing expected build output: ${src}`)
    process.exit(1)
  }
  cpSync(src, dest, { recursive: true })
  console.log(`Copied ${path.relative(projectRoot, src)} -> ${path.relative(projectRoot, dest)}`)
}

// The standalone output's copy of better-sqlite3 has the system-Node-ABI
// binary Next built it with — swap in the Electron-ABI one produced by
// `node electron/rebuild-native.mjs` (run once locally for Mac, in CI for
// Windows — see .github/workflows/build-windows.yml), matching whichever
// platform/arch this build is running on.
const prebuiltBinary = path.join(
  root,
  "prebuilt",
  `better_sqlite3-${process.platform}-${process.arch}-electron.node`
)
const targetBinary = path.join(
  projectRoot,
  ".next/standalone/node_modules/better-sqlite3/build/Release/better_sqlite3.node"
)

if (!existsSync(prebuiltBinary)) {
  console.error(
    `Missing Electron-ABI prebuilt binary: ${path.relative(projectRoot, prebuiltBinary)}\n` +
      `Run \`node electron/rebuild-native.mjs\` first (natively, on this platform).`
  )
  process.exit(1)
}

copyFileSync(prebuiltBinary, targetBinary)
console.log(
  `Applied Electron-ABI native binary for ${process.platform}/${process.arch}`
)
