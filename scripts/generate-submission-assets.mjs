import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#e9eef6",
  ink: "#07101f",
  panel: "#ffffff",
  soft: "#f8fafc",
  line: "#c6d2e2",
  muted: "#64748b",
  blue: "#00d1ff",
  pink: "#ff4f8b",
  green: "#8cff5a",
  yellow: "#ffcf45",
  violet: "#9f7cff",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 420C280 350 380 120 680 190C980 260 1020 70 1284 120V0H0Z" fill="#dbeafe"/>
    <path d="M0 2578C310 2490 430 2688 705 2608C980 2528 1080 2700 1284 2635V2778H0Z" fill="#e0f2fe"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  return `
    <text x="72" y="126" font-family="Courier New, monospace" font-size="32" font-weight="900" fill="${c.muted}">TAGFOLIO</text>
    <text x="72" y="228" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="78" y="292" font-family="Arial, sans-serif" font-size="31" font-weight="800" fill="${c.muted}">${esc(subtitle)}</text>
  `;
}

function info(x, y, w, h, label, lines, accent = c.blue) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${c.panel}" stroke="${c.line}" stroke-width="4"/>
    <rect x="${x}" y="${y}" width="18" height="${h}" rx="9" fill="${accent}"/>
    <text x="${x + 46}" y="${y + 58}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.muted}">${esc(label)}</text>
    ${lines.map((line, i) => `<text x="${x + 46}" y="${y + 118 + i * 42}" font-family="Arial, sans-serif" font-size="${i === 0 ? 38 : 29}" font-weight="900" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function tagCard(x, y, name, role, interest, city, accent = c.blue) {
  const interestLines = wrap(`Interested in ${interest}`, 28);
  return `
    <rect x="${x}" y="${y}" width="1060" height="780" rx="28" fill="${c.panel}" stroke="${c.line}" stroke-width="5"/>
    <rect x="${x}" y="${y}" width="42" height="780" rx="20" fill="${accent}"/>
    <rect x="${x + 76}" y="${y + 52}" width="914" height="676" rx="22" fill="${c.soft}" stroke="${c.line}" stroke-width="4"/>
    <circle cx="${x + 152}" cy="${y + 132}" r="44" fill="${accent}"/>
    <path d="M${x + 138} ${y + 128}C${x + 138} ${y + 108} ${x + 166} ${y + 108} ${x + 166} ${y + 128}C${x + 166} ${y + 148} ${x + 138} ${y + 148} ${x + 138} ${y + 128}Z" fill="${c.ink}"/>
    <path d="M${x + 124} ${y + 170}C${x + 136} ${y + 150} ${x + 168} ${y + 150} ${x + 180} ${y + 170}" stroke="${c.ink}" stroke-width="8" fill="none"/>
    <text x="${x + 220}" y="${y + 112}" font-family="Courier New, monospace" font-size="26" font-weight="900" fill="${c.muted}">TAGFOLIO PASS</text>
    <text x="${x + 220}" y="${y + 162}" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="${c.ink}">Onchain name tag</text>
    <path d="M${x + 118} ${y + 218}H${x + 948}" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 118}" y="${y + 290}" font-family="Courier New, monospace" font-size="26" font-weight="900" fill="${c.muted}">HELLO, I AM</text>
    <text x="${x + 118}" y="${y + 402}" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="${c.ink}">${esc(name)}</text>
    <rect x="${x + 118}" y="${y + 450}" width="300" height="72" rx="36" fill="${accent}"/>
    <text x="${x + 268}" y="${y + 497}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">${esc(role)}</text>
    ${interestLines.map((line, i) => `<text x="${x + 118}" y="${y + 596 + i * 44}" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="#1e293b">${esc(line)}</text>`).join("")}
    <rect x="${x + 718}" y="${y + 430}" width="190" height="190" rx="18" fill="${c.panel}" stroke="${c.line}" stroke-width="4"/>
    <rect x="${x + 770}" y="${y + 482}" width="86" height="86" rx="12" fill="${accent}"/>
    <text x="${x + 813}" y="${y + 674}" text-anchor="middle" font-family="Courier New, monospace" font-size="25" font-weight="900" fill="${c.muted}">${esc(city)}</text>
  `;
}

function screenshot1() {
  return frame(`
    ${header("Make a Base name tag.", "Create a wallet-backed intro for events, meetups, and community calls.")}
    ${info(72, 370, 548, 220, "COMPOSE", ["Name, role, city", "Interest and accent"], c.blue)}
    ${info(664, 370, 548, 220, "SAVE", ["Create on Base", "Load again by ID"], c.pink)}
    ${tagCard(112, 700, "Tony", "Builder", "Base apps and useful tools", "Shanghai", c.blue)}
    <rect x="72" y="2518" width="1140" height="118" rx="20" fill="${c.blue}"/>
    <text x="642" y="2591" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">CREATE ON BASE</text>
  `);
}

function screenshot2() {
  return frame(`
    ${header("A tag for every meetup.", "Pick a role, color, and interest so people know what to ask you about.")}
    ${tagCard(112, 410, "Mina", "Artist", "generative identity and social objects", "Seoul", c.pink)}
    ${info(72, 1290, 548, 245, "WHY", ["Fast introductions", "Wallet identity included"], c.green)}
    ${info(664, 1290, 548, 245, "FIELDS", ["Role, interest, city", "Accent color and owner"], c.yellow)}
  `);
}

function screenshot3() {
  return frame(`
    ${header("Look up tags by ID.", "Reload saved name tags with owner wallet and timestamp for quick intros.")}
    ${info(72, 380, 1140, 230, "LOOKUP", ["Tag ID 18", "Owner 0x9936...9652", "Saved on Base"], c.violet)}
    ${tagCard(112, 720, "Alex", "Researcher", "onchain UX and public goods", "Lisbon", c.violet)}
    ${info(72, 1605, 548, 245, "EVENTS", ["Builder meetups", "Hackathons and demos"], c.blue)}
    ${info(664, 1605, 548, 245, "SHARING", ["Small profile card", "No long setup"], c.green)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="150" y="160" width="724" height="704" rx="46" fill="${c.panel}" stroke="${c.ink}" stroke-width="26"/>
    <rect x="150" y="160" width="94" height="704" rx="46" fill="${c.blue}"/>
    <circle cx="386" cy="330" r="76" fill="${c.blue}"/>
    <path d="M356 318C356 274 416 274 416 318C416 362 356 362 356 318Z" fill="${c.ink}"/>
    <path d="M326 410C355 362 417 362 446 410" stroke="${c.ink}" stroke-width="24" fill="none"/>
    <text x="330" y="560" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="${c.ink}">TAG</text>
    <path d="M330 650H724" stroke="${c.line}" stroke-width="26"/>
    <path d="M330 726H620" stroke="${c.line}" stroke-width="26"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="96" y="158" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="${c.ink}">Tagfolio</text>
    <text x="102" y="232" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="${c.muted}">Create wallet-backed name tags on Base.</text>
    ${tagCard(760, 118, "Tony", "Builder", "Base apps and useful tools", "Shanghai", c.blue)}
    ${info(96, 355, 560, 220, "FOR", ["Meetups and demos", "Community intros"], c.pink)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2),
  "utf8",
);

await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Tagfolio",
    "",
    "App Name: Tagfolio",
    "Tagline: Make a Base name tag",
    "Description: Create a compact onchain name tag with role, interest, city, wallet, accent color, and timestamp for events or community intros.",
    "",
    "Domain: https://tagfolio.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
