import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const photos = [
  ["p01", "1494790108377-be9c29b29330"],
  ["p02", "1500648767791-00dcc994a43e"],
  ["p03", "1534528741775-53994a69daeb"],
  ["p04", "1507003211169-0a1dd7228f2d"],
  ["p05", "1524504388940-b1c1722653e1"],
  ["p06", "1506794778202-cad84cf45f1d"],
  ["p07", "1531123897727-8f129e1688ce"],
  ["p08", "1519085360753-af0119f7cbe7"],
  ["p09", "1488426862026-3ee34a7d66df"],
  ["p10", "1527980965255-d3b416303d12"],
  ["p11", "1544005313-94ddf0286df2"],
  ["p12", "1560250097-0b93528c311a"],
  ["p13", "1544725176-7c40e5a71c5e"],
  ["p14", "1492562080023-ab3db95bfbce"],
  ["p15", "1529626455594-4ff0802cfb7e"],
  ["p16", "1552058544-f2b08422138a"],
  ["p17", "1573496359142-b8d87734a5a2"],
  ["p18", "1568602471122-7832951cc4c5"],
  ["p19", "1526510747491-58f928ec870f"],
  ["p20", "1531746020798-e6953c6e8e04"],
  ["p21", "1557862921-37829c790f19"],
  ["p22", "1535713875002-d1d0cf377fde"],
  ["p23", "1499996860823-5214fcc65f8f"],
  ["p24", "1554151228-14d9def656e4"],
  ["p25", "1566492031773-4f4e44671857"],
  ["p26", "1580489944761-15a19d654956"],
  ["p27", "1522075469751-3a6694fb2f61"],
  ["p28", "1524250502761-1ac6f2e30d43"],
  ["p29", "1539571696357-5a69c17a67c6"],
  ["p30", "1517841905240-472988babdf9"],
  ["me", "1508214751196-bcfd4ca60f91"],
];

const outputDir = path.join(process.cwd(), "public", "profiles");
await mkdir(outputDir, { recursive: true });

for (const [name, id] of photos) {
  const url = `https://images.unsplash.com/photo-${id}?w=900&h=1200&fit=crop&crop=faces&q=82&fm=jpg&ixlib=rb-4.0.3`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${name}: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(outputDir, `${name}.jpg`), bytes);
  console.log(`${name}.jpg  ${(bytes.length / 1024).toFixed(0)} KB`);
}
