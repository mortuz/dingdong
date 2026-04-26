import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = resolve(rootDir, "public")

const ensureDir = async (path) => {
  await mkdir(path, { recursive: true })
}

const writeSvgPng = async ({ width, height, svg, output }) => {
  await sharp(Buffer.from(svg))
    .png()
    .resize(width, height)
    .toFile(resolve(publicDir, output))
}

const iconSvg = ({ maskable = false }) => `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="${maskable ? 240 : 220}" fill="#0b0b0b"/>
  <g>
    <circle cx="512" cy="512" r="${maskable ? 330 : 360}" fill="#0ff4b5" opacity="0.14"/>
    <circle cx="390" cy="390" r="170" fill="#1b1b1b"/>
    <circle cx="634" cy="634" r="170" fill="#1b1b1b"/>
    <path d="M390 284c58 0 106 47 106 106s-48 106-106 106-106-47-106-106 48-106 106-106Zm244 244c58 0 106 47 106 106s-48 106-106 106-106-47-106-106 48-106 106-106Z" fill="#0ff4b5"/>
    <path d="M252 714c28-92 96-138 204-138h112c104 0 173 47 204 138" fill="none" stroke="#f5f7f8" stroke-width="52" stroke-linecap="round"/>
  </g>
</svg>`

const wideScreenshotSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#08110f"/>
      <stop offset="100%" stop-color="#0b0b0b"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="180" cy="80" r="220" fill="#0ff4b5" opacity="0.12"/>
  <text x="88" y="130" fill="#f5f7f8" font-size="72" font-family="Arial, sans-serif" font-weight="700">DingDong</text>
  <text x="88" y="182" fill="#8f9a96" font-size="28" font-family="Arial, sans-serif">Convert VND or USD into INR, even offline.</text>
  <rect x="88" y="226" width="420" height="360" rx="28" fill="#131313" stroke="#1e1e1e"/>
  <rect x="120" y="266" width="356" height="58" rx="16" fill="#1a1a1a"/>
  <rect x="128" y="274" width="170" height="42" rx="12" fill="#0ff4b5"/>
  <text x="188" y="302" text-anchor="middle" fill="#08110f" font-size="20" font-family="Arial, sans-serif" font-weight="700">VND</text>
  <text x="354" y="302" text-anchor="middle" fill="#9c9c9c" font-size="20" font-family="Arial, sans-serif">USD</text>
  <rect x="120" y="348" width="356" height="66" rx="16" fill="#1e1e1e" stroke="#333"/>
  <text x="148" y="389" fill="#4acfa8" font-size="28" font-family="Arial, sans-serif">250000 ₫</text>
  <text x="120" y="478" fill="#f5f7f8" font-size="56" font-family="Arial, sans-serif" font-weight="700">₹826.25</text>
  <text x="120" y="528" fill="#8f9a96" font-size="22" font-family="Arial, sans-serif">Rate: 1 ₫ = ₹0.00331</text>
</svg>`

const narrowScreenshotSvg = `
<svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#08110f"/>
      <stop offset="100%" stop-color="#0b0b0b"/>
    </linearGradient>
  </defs>
  <rect width="750" height="1334" fill="url(#bg)"/>
  <circle cx="120" cy="90" r="180" fill="#0ff4b5" opacity="0.12"/>
  <text x="48" y="140" fill="#f5f7f8" font-size="64" font-family="Arial, sans-serif" font-weight="700">DingDong</text>
  <text x="48" y="192" fill="#8f9a96" font-size="28" font-family="Arial, sans-serif">Fast INR conversion on mobile.</text>
  <rect x="48" y="258" width="420" height="360" rx="28" fill="#131313" stroke="#1e1e1e"/>
  <rect x="80" y="298" width="356" height="58" rx="16" fill="#1a1a1a"/>
  <rect x="256" y="306" width="172" height="42" rx="12" fill="#0ff4b5"/>
  <text x="168" y="334" text-anchor="middle" fill="#9c9c9c" font-size="20" font-family="Arial, sans-serif">VND</text>
  <text x="342" y="334" text-anchor="middle" fill="#08110f" font-size="20" font-family="Arial, sans-serif" font-weight="700">USD</text>
  <rect x="80" y="380" width="356" height="66" rx="16" fill="#1e1e1e" stroke="#333"/>
  <text x="108" y="421" fill="#4acfa8" font-size="28" font-family="Arial, sans-serif">50 $</text>
  <text x="80" y="510" fill="#f5f7f8" font-size="56" font-family="Arial, sans-serif" font-weight="700">₹4,273.50</text>
  <text x="80" y="560" fill="#8f9a96" font-size="22" font-family="Arial, sans-serif">Rate: 1 $ = ₹85.47</text>
</svg>`

await ensureDir(publicDir)

await Promise.all([
  writeSvgPng({
    width: 192,
    height: 192,
    svg: iconSvg({ maskable: false }),
    output: "icon-192.png",
  }),
  writeSvgPng({
    width: 512,
    height: 512,
    svg: iconSvg({ maskable: false }),
    output: "icon-512.png",
  }),
  writeSvgPng({
    width: 512,
    height: 512,
    svg: iconSvg({ maskable: true }),
    output: "icon-maskable-512.png",
  }),
  writeSvgPng({
    width: 180,
    height: 180,
    svg: iconSvg({ maskable: false }),
    output: "apple-touch-icon.png",
  }),
  writeSvgPng({
    width: 1280,
    height: 720,
    svg: wideScreenshotSvg,
    output: "screenshot-wide.png",
  }),
  writeSvgPng({
    width: 750,
    height: 1334,
    svg: narrowScreenshotSvg,
    output: "screenshot-narrow.png",
  }),
])

console.log("Generated PWA assets in public/")
