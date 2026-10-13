/**
 * Runs cf's command generator, the Rust program in `packages/generator`,
 * on an OpenAPI document, splicing in cf's hand-written commands.
 */
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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
	const dir = mkdtempSync(join(tmpdir(), "cf-generator-"));
	try {
		const specPath = join(dir, "openapi.json");
		const configPath = join(dir, "hand-written.json");
		writeFileSync(specPath, JSON.stringify(spec));
		writeFileSync(configPath, JSON.stringify(config));
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
