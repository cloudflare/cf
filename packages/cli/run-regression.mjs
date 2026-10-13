import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";

// Launch the Vitest supplied by Vite+ directly so the deadline owns the test
// process and its forks, rather than only killing a package-manager wrapper.
const requireVitePlus = createRequire(
	import.meta.resolve("vite-plus/package.json")
);
const vitestDir = dirname(requireVitePlus.resolve("vitest/package.json"));
const windows = process.platform === "win32";
const start = performance.now();
const child = spawn(
	process.execPath,
	[
		join(vitestDir, "vitest.mjs"),
		"run",
		"--config",
		"regression.config.ts",
		...process.argv.slice(2),
	],
	{ stdio: "inherit", detached: !windows }
);
let expired = false;
const deadline = setTimeout(() => {
	expired = true;
	console.error("Regression suite exceeded its three-minute wall-time budget.");
	if (child.pid !== undefined) {
		if (windows) {
			spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
				stdio: "ignore",
			});
		} else {
			try {
				process.kill(-child.pid, "SIGKILL");
			} catch {
				child.kill("SIGKILL");
			}
		}
	}
}, 180_000);

child.on("error", (error) => {
	clearTimeout(deadline);
	console.error(error);
	process.exitCode = 1;
});
child.on("exit", (code) => {
	clearTimeout(deadline);
	const seconds = (performance.now() - start) / 1000;
	console.error(`HTTP regression wall time: ${seconds.toFixed(2)}s / 180s`);
	process.exitCode = expired || seconds > 180 ? 1 : (code ?? 1);
});
