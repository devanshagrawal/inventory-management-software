import sharp from "sharp"
import png2icons from "png2icons"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(root, "icons")
mkdirSync(outDir, { recursive: true })

const svgPath = path.join(root, "icon.svg")
const pngPath = path.join(outDir, "icon.png")

const svg = readFileSync(svgPath)
const pngBuffer = await sharp(svg).resize(1024, 1024).png().toBuffer()
writeFileSync(pngPath, pngBuffer)
console.log(`Wrote ${path.relative(root, pngPath)}`)

const icns = png2icons.createICNS(pngBuffer, png2icons.BILINEAR, 0)
if (icns) {
  writeFileSync(path.join(outDir, "icon.icns"), icns)
  console.log("Wrote icons/icon.icns")
} else {
  console.error("Failed to generate .icns")
  process.exit(1)
}

const ico = png2icons.createICO(pngBuffer, png2icons.BILINEAR, 0, false, true)
if (ico) {
  writeFileSync(path.join(outDir, "icon.ico"), ico)
  console.log("Wrote icons/icon.ico")
} else {
  console.error("Failed to generate .ico")
  process.exit(1)
}
