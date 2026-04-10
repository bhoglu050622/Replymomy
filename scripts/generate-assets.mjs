/**
 * Generate static AI image assets for The Midnight Guild.
 *
 * Run with:
 *   node --env-file=.env.local scripts/generate-assets.mjs
 *
 * Requires: REPLICATE_API_TOKEN in .env.local
 * Install once: npm install replicate
 */

import Replicate from "replicate";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const MODEL = "lucataco/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165fffb3";

const ASSETS = [
  {
    file: "public/hero-texture.jpg",
    width: 1344,
    height: 768,
    prompt:
      "abstract luxury dark, swirling champagne gold smoke tendrils on obsidian black, volumetric atmospheric light rays, fine film grain texture, no text, no faces, no watermark, ultra high quality",
  },
  {
    file: "public/spotlight-bg.jpg",
    width: 1344,
    height: 768,
    prompt:
      "dark velvet burgundy wine atmosphere, deep crimson shadows, dramatic side rim lighting, silk and velvet texture, moody editorial photography aesthetic, no faces, no text, no watermark",
  },
  {
    file: "public/og-guild.jpg",
    width: 1344,
    height: 768,
    prompt:
      "luxury exclusive brand visual, dark obsidian background, champagne gold light bloom, geometric ornamental frame elements, velvet fabric texture, high end fashion editorial, no text visible, no faces, no watermark",
  },
];

const NEGATIVE =
  "bright colors, white background, faces, text, watermark, neon, cartoon, illustration, low quality";

async function generateAsset(asset) {
  console.log(`\nGenerating: ${asset.file}`);
  console.log(`Prompt: ${asset.prompt.slice(0, 80)}...`);

  const output = await replicate.run(MODEL, {
    input: {
      prompt: asset.prompt,
      negative_prompt: NEGATIVE,
      width: asset.width,
      height: asset.height,
      num_inference_steps: 4,
      guidance_scale: 0,
      seed: 42,
      num_outputs: 1,
      scheduler: "K_EULER",
    },
  });

  const url = Array.isArray(output) ? output[0] : output;
  if (!url) throw new Error(`No output URL for ${asset.file}`);

  console.log(`Downloading from: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const destPath = join(process.cwd(), asset.file);

  // Ensure public/ exists
  await mkdir(join(process.cwd(), "public"), { recursive: true });
  await writeFile(destPath, buffer);

  console.log(`Saved: ${asset.file} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("Missing REPLICATE_API_TOKEN in .env.local");
    process.exit(1);
  }

  console.log("Generating Midnight Guild visual assets via Replicate SDXL Lightning...");

  for (const asset of ASSETS) {
    try {
      await generateAsset(asset);
    } catch (err) {
      console.error(`Failed: ${asset.file}`, err.message);
    }
  }

  console.log("\nDone. Files written to public/");
}

main();
