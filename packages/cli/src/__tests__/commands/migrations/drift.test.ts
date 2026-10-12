import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { generateResourceIndexFile } from "../../../../generator/emit/index-files.js";
import { handWrittenSubGroups } from "../../../../generator/hand-written-overrides.js";
import type { CommandMeta } from "@cloudflare/forge";

/**
 * Drift guard for the `d1/migrations` hand-written sub-group, required by
 * `generator/hand-written-overrides.ts`.
 *
 * A sub-group has no spec operation behind it, so nothing is derived and
 * nothing fails loudly when the sidecar and the implementation disagree —
 * `meta.json` just quietly starts describing a command that no longer
 * matches. These assertions are what notice.
 *
 * That the splice itself works is proven end-to-end by `apply.test.ts` /
 * `list.test.ts` / `create.test.ts`, which invoke `cf d1 migrations …`
 * through the real generated `d1` index.
 */
describe("d1/migrations hand-written sub-group", () => {
	const dir = fileURLToPath(
		new URL("../../../commands/d1/migrations/", import.meta.url)
	);
	const meta = JSON.parse(
		fs.readFileSync(path.join(dir, "meta.json"), "utf-8")
	) as CommandMeta[];

	it("is registered against the d1 product", () => {
		expect(handWrittenSubGroups("d1")).toEqual([
			{
				name: "migrations",
				dir: "d1/migrations",
				dryRun: "preview",
				describe: expect.any(String),
			},
		]);
	});

	it("fails clearly if the spec adds a direct migrations command", () => {
		const schema = {
			name: "d1",
			description: "D1",
		} as Parameters<typeof generateResourceIndexFile>[0];

		expect(() => generateResourceIndexFile(schema, ["migrations"], [])).toThrow(
			'Hand-written sub-group "d1 migrations" collides with a command or group of the same name in the spec.'
		);
	});

	it("has a sidecar entry per implemented subcommand", () => {
		const implemented = fs
			.readdirSync(dir)
			.filter(
				(f) =>
					f.endsWith(".ts") &&
					!["index.ts", "shared.ts", "bookkeeping.ts"].includes(f)
			)
			.map((f) => f.replace(/\.ts$/, ""))
			.sort();

		expect(implemented).toEqual(["apply", "create", "list"]);
		expect(meta.map((m) => m.name).sort()).toEqual(implemented);
	});

	it("describes each subcommand at its real command path", () => {
		for (const entry of meta) {
			expect(entry.fullPath).toEqual(["d1", "migrations", entry.name]);
			expect(entry.command).toBe(`cf d1 migrations ${entry.name}`);
			expect(entry.usage.startsWith(`cf d1 migrations ${entry.name}`)).toBe(
				true
			);
			expect(entry.description.length).toBeGreaterThan(0);
		}
	});

	it("claims no API operation, because there is none to claim", () => {
		// Unlike a leaf override, nothing here maps onto a spec operation. If
		// one of these ever gains an httpMethod/apiPath/operationId, the spec
		// has probably grown a real endpoint and this should become a
		// generated command (or a leaf override) instead.
		for (const entry of meta) {
			expect(entry.httpMethod).toBeUndefined();
			expect(entry.apiPath).toBeUndefined();
			expect(entry.operationId).toBeUndefined();
		}
	});

	it("documents every flag the commands actually accept", () => {
		const optionNames = (name: string) =>
			(meta.find((m) => m.name === name)?.options ?? [])
				.map((o) => o.name)
				.sort();

		expect(optionNames("apply")).toEqual([
			"dir",
			"dry-run",
			"pattern",
			"table",
		]);
		expect(optionNames("list")).toEqual(["dir", "dry-run", "pattern", "table"]);
		// `create` is offline, so it has no --table: it never reads the
		// bookkeeping table.
		expect(optionNames("create")).toEqual(["dir", "dry-run", "pattern"]);
	});

	it("does not advertise incompatible ORM bookkeeping tables", () => {
		for (const name of ["apply", "list"]) {
			const table = meta
				.find((entry) => entry.name === name)
				?.options?.find((option) => option.name === "table");
			expect(table?.description).toContain("Wrangler's bookkeeping schema");
			expect(table?.description).not.toMatch(/drizzle|__drizzle/i);
		}
	});

	it("describes database inputs as IDs", () => {
		for (const name of ["apply", "list"]) {
			const database = meta
				.find((entry) => entry.name === name)
				?.arguments.find((argument) => argument.name === "database");
			expect(database?.description).toBe("D1 database ID");
		}
	});
});
