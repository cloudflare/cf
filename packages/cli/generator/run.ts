/**
 * Runs cf's command generator, the Rust program in `packages/generator`,
 * on an OpenAPI document, splicing in cf's hand-written commands.
 */
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	GLOBAL_OPTION_NAMES,
	FUTURE_OPTION_NAMES,
	FLAG_OWNER_TEXT,
} from "../src/lib/global-options.js";
import type { HandWrittenCommand } from "../src/commands/hand-written.js";
import type {
	CommandMeta,
	LeafCommandMeta,
	LeafOverrideMeta,
} from "../src/lib/command-meta.js";

/**
 * The `meta.ts` sidecars of the hand-written commands, by directory, as
 * `src/commands/hand-written-meta.ts` lists them. Keyed by any string, so
 * tests can generate with commands of their own.
 */
export interface Sidecars {
	/** Every command under each root. */
	roots: Readonly<Record<string, readonly CommandMeta[]>>;
	/** Every leaf of each subgroup. */
	subgroups: Readonly<Record<string, readonly CommandMeta[]>>;
	leaves: Readonly<Record<string, LeafCommandMeta>>;
	leafOverrides: Readonly<Record<string, LeafOverrideMeta>>;
}

/** The hand-written commands the generator splices into the tree. */
export interface GeneratorConfig {
	handWritten: readonly HandWrittenCommand[];
	sidecars: Sidecars;
}

const forgeBin = join(
	dirname(
		createRequire(import.meta.url).resolve("@cloudflare/forge/package.json")
	),
	"bin",
	"forge.cjs"
);

const manifest = fileURLToPath(
	new URL("../../generator/Cargo.toml", import.meta.url)
);

/**
 * Generates the commands of the OpenAPI document `spec` into `out`, with the
 * hand-written commands of `config`, running Cargo with `options`. Cargo
 * builds the generator first if it is out of date.
 */
export function runGenerator(
	spec: unknown,
	config: GeneratorConfig,
	out: string,
	options: Pick<ExecFileSyncOptions, "env" | "stdio">
): void {
	const forgePackage = JSON.parse(
		readFileSync(new URL("../package.json", import.meta.url), "utf8")
	) as { devDependencies: Record<string, string> };
	const rev =
		forgePackage.devDependencies["@cloudflare/forge"]?.match(
			/@([0-9a-f]{40})$/
		)?.[1];
	if (!rev || !readFileSync(manifest, "utf8").includes(`rev = "${rev}"`)) {
		throw new Error(
			"Forge pins differ; run node scripts/sync-generator-forge.mjs from the repository root"
		);
	}
	const dir = mkdtempSync(join(tmpdir(), "cf-generator-"));
	try {
		const specPath = join(dir, "openapi.json");
		const configPath = join(dir, "hand-written.json");
		const normalized = execFileSync(
			process.execPath,
			[forgeBin, "normalize", "--leave-old-extensions", "-"],
			{
				input: JSON.stringify(spec),
				maxBuffer: 256 * 1024 * 1024,
				env: options.env,
			}
		);
		writeFileSync(specPath, normalized);
		writeFileSync(
			configPath,
			JSON.stringify({
				...config,
				flagPolicy: {
					globalOptions: GLOBAL_OPTION_NAMES,
					futureOptions: FUTURE_OPTION_NAMES,
					ownerText: FLAG_OWNER_TEXT,
				},
			})
		);
		execFileSync(
			"cargo",
			[
				"run",
				"--release",
				"--locked",
				"--quiet",
				"--manifest-path",
				manifest,
				"--",
				specPath,
				"--config",
				configPath,
				"--out",
				out,
			],
			options
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
