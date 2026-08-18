import { context } from "esbuild";
import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const sourceDirectory = "codes";
const outputDirectory = "dist";
const watchMode = process.argv.includes("--watch");

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      return entry.isDirectory() ? findJavaScriptFiles(path) : path;
    }),
  );

  return files.flat().filter((file) => extname(file) === ".js");
}

const entryPoints = await findJavaScriptFiles(sourceDirectory);

if (entryPoints.length === 0) {
  console.error(`No JavaScript files found under ${sourceDirectory}/.`);
  process.exitCode = 1;
} else {
  const buildContext = await context({
    entryPoints,
    outdir: outputDirectory,
    outbase: sourceDirectory,
    bundle: true,
    minify: true,
    platform: "browser",
    target: ["es2018"],
    logLevel: "info",
  });

  if (watchMode) {
    await buildContext.watch();
    console.log(`Watching ${sourceDirectory}/ for changes...`);
  } else {
    await buildContext.rebuild();
    await buildContext.dispose();
  }
}
