import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const coreAlias = "npm:@voidzero-dev/vite-plus-core@";
const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function workspacePin(section, key) {
	return new RegExp(
		String.raw`(^${section}:[^\r\n]*\r?\n(?:[ \t#][^\r\n]*\r?\n|\r?\n)*?  ["']?${key}["']?:[ \t]*["']?)([^\s"'#]+)`,
		"m"
	);
}

const vitePlusPin = workspacePin("catalog", "vite-plus");
const vitePin = workspacePin("catalog", "vite");
const vitestPin = workspacePin("overrides", String.raw`vitest@\*`);

export async function syncVitePlus(workspace, fetchRelease = fetch) {
	const version = vitePlusPin.exec(workspace)?.[2];
	if (!version || !exactVersion.test(version)) {
		throw new Error("Expected an exact vite-plus version in the pnpm catalog");
	}
	if (!vitePin.test(workspace) || !vitestPin.test(workspace)) {
		throw new Error("Missing the Vite or Vitest pin in pnpm-workspace.yaml");
	}

	const release = await fetchRelease(
		`https://registry.npmjs.org/vite-plus/${encodeURIComponent(version)}`,
		{ signal: AbortSignal.timeout(30_000) }
	);
	if (!release.ok) {
		throw new Error(
			`Could not read vite-plus@${version} metadata: HTTP ${release.status}`
		);
	}
	const { dependencies } = await release.json();
	const { vite, vitest } = dependencies ?? {};
	if (
		typeof vite !== "string" ||
		!vite.startsWith(coreAlias) ||
		!exactVersion.test(vite.slice(coreAlias.length)) ||
		typeof vitest !== "string" ||
		!exactVersion.test(vitest)
	) {
		throw new Error(
			`Expected exact Vite and Vitest dependencies in vite-plus@${version}`
		);
	}

	return workspace
		.replace(vitePin, (_match, prefix) => `${prefix}${vite}`)
		.replace(vitestPin, (_match, prefix) => `${prefix}${vitest}`);
}

if (import.meta.main) {
	const path = "pnpm-workspace.yaml";
	const workspace = readFileSync(path, "utf8");
	const updated = await syncVitePlus(workspace);
	if (updated !== workspace) {
		writeFileSync(path, updated);
	}
	execSync("pnpm install --lockfile-only --no-frozen-lockfile", {
		stdio: "inherit",
	});
}
