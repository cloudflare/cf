import { mkdirSync, writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

describe("cf --local end to end", () => {
	runInTempDir();

	let out: ReturnType<typeof vi.spyOn>;
	let log: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		log = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		out.mockRestore();
		log.mockRestore();
	});

	it("writes and reads persisted KV data through a real local runtime", async () => {
		const env = { CLOUDFLARE_API_TOKEN: undefined };
		const local = ["--local", "--persist-to", "state"];

		await runCf(
			[
				"kv",
				"keys",
				"put",
				"greeting",
				"--namespace-id",
				"e2e-namespace",
				"--body",
				"hello",
				...local,
			],
			env
		);

		log.mockClear();
		await runCf(
			["kv", "keys", "list", "--namespace-id", "e2e-namespace", ...local],
			env
		);

		const listed = JSON.parse(String(log.mock.calls[0]?.[0])) as unknown;
		const items =
			Array.isArray(listed) || listed === null || typeof listed !== "object"
				? listed
				: "data" in listed
					? listed.data
					: undefined;
		expect(items).toEqual([{ name: "greeting" }]);

		out.mockClear();
		await runCf(
			[
				"kv",
				"keys",
				"get",
				"greeting",
				"--namespace-id",
				"e2e-namespace",
				"--text",
				...local,
			],
			env
		);

		expect(
			out.mock.calls.map((call: unknown[]) => String(call[0])).join("")
		).toBe("hello");
	}, 60_000);

	it("applies and lists persisted D1 migrations without credentials", async () => {
		const databaseId = "38a2e1b9-3a45-4f6e-9d0c-8b7a6c5d4e3f";
		mkdirSync("migrations");
		writeFileSync(
			"migrations/0001_users.sql",
			"CREATE TABLE users (id INTEGER PRIMARY KEY);"
		);
		const env = { CLOUDFLARE_API_TOKEN: undefined };
		const local = ["--local", "--persist-to", "state"];

		const applied = await runCf(
			["d1", "migrations", "apply", databaseId, ...local],
			env
		);
		expect(applied.exitCode).toBe(0);

		log.mockClear();
		const listed = await runCf(
			["d1", "migrations", "list", databaseId, ...local],
			env
		);

		expect(listed.exitCode).toBe(0);
		expect(
			JSON.parse(
				log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n")
			)
		).toEqual([]);
	}, 60_000);

	it("explains how to retry commands without a local implementation", async () => {
		await expect(
			runCf(["zones", "list", "--local"], {
				CLOUDFLARE_API_TOKEN: undefined,
			})
		).rejects.toThrow(
			/no local equivalent.*re-run without --local.*GET \/zones/i
		);
	}, 60_000);

	it("rejects a persistence path that is not a directory", async () => {
		mkdirSync("state", { recursive: true });
		writeFileSync("state/v3", "not a directory");

		await expect(
			runCf(
				[
					"kv",
					"keys",
					"list",
					"--namespace-id",
					"e2e-namespace",
					"--local",
					"--persist-to",
					"state",
				],
				{ CLOUDFLARE_API_TOKEN: undefined }
			)
		).rejects.toThrow(/local persistence path must be a directory/i);
	}, 60_000);
});
