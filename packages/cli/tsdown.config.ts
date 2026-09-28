import { cpSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { defineConfig } from "tsdown";

// `pnpm build` defaults to a production bundle — minified, no source maps.
// Source maps disclose internal source (including the vendored
// the generated SDK) so they must never ship to npm by accident.
// Defaulting to prod means the only way to get source maps in dist/ is to
// explicitly opt in via `NODE_ENV=development pnpm build` (or use the
// `dev` script via tsx, which bypasses the bundler entirely).
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = !isDevelopment;

export default defineConfig({
	// `index` is the CLI bundle. `delegate` is a deliberately small,
	// standalone entry so `bin/cf` can run local-install delegation
	// (Wrangler-2 style) WITHOUT importing the full command tree — a
	// delegating invocation must not pay to load the global cf's bundle.
	entry: {
		index: "src/index.ts",
		delegate: "src/lib/delegate.ts",
		"update-check-worker": "src/update-check-worker.ts",
		config: "src/config.ts",
	},
	format: ["esm"],
	platform: "node",
	target: "node20",
	outDir: "dist",
	clean: true,
	sourcemap: !isProduction,
	minify: isProduction,
	dts: { entry: ["src/config.ts"] },
	// blake3-wasm is CJS and uses `__dirname` at module init time to locate
	// its .wasm binary. Bundling it into an ESM chunk breaks this — __dirname
	// is undefined in ESM scope. Keeping it external lets Node resolve it
	// from node_modules at runtime where CJS globals work correctly.
	//
	// miniflare (`--local`) is external for the same class of reason: it
	// resolves the local-explorer UI assets, the workerd binary, and its
	// bundled worker scripts relative to its own on-disk location, and
	// throws ERR_MISSING_EXPLORER_UI if they aren't beside the module.
	external: ["blake3-wasm", "miniflare"],
	// The CLI version is inlined directly via a JSON import in src/version.ts
	// (statically resolved by rolldown). PACKAGE_PRERELEASE_LABEL stays here
	// because it's a CI-only build-time string with no package.json source.
	define: {
		...(process.env.PACKAGE_PRERELEASE_LABEL
			? {
					PACKAGE_PRERELEASE_LABEL: JSON.stringify(
						process.env.PACKAGE_PRERELEASE_LABEL
					),
				}
			: {}),
		"process.env.SPARROW_SOURCE_KEY": JSON.stringify(
			process.env.SPARROW_SOURCE_KEY ?? ""
		),
	},
	banner: {
		js: "#!/usr/bin/env node",
	},
	onSuccess: async () => {
		// Copy command metadata to dist folder for --help to work from any directory
		const srcMeta = join("src", "commands", "_generated", "_meta");
		const distMeta = join("dist", "_meta");
		if (existsSync(srcMeta)) {
			mkdirSync(distMeta, { recursive: true });
			cpSync(srcMeta, distMeta, { recursive: true });
		}
	},
});
