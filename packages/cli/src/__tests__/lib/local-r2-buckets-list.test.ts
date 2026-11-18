import { resolve } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { Miniflare } from "miniflare";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

// cloudflare/cf#689: `cf r2 buckets list --local` answers an empty list even
// though the persisted local state holds a bucket whose objects `--local`
// object commands can read.
describe("cf r2 buckets list --local", () => {
	runInTempDir();

	const env = { CLOUDFLARE_API_TOKEN: undefined };
	const local = ["--local", "--persist-to", "state"];

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

	function printed(spy: ReturnType<typeof vi.spyOn>): string {
		return spy.mock.calls.map((call: unknown[]) => String(call[0])).join("");
	}

	async function listBucketNames(): Promise<string[]> {
		out.mockClear();
		log.mockClear();
		const result = await runCf(["r2", "buckets", "list", ...local], env);
		expect(result.exitCode).toBe(0);
		const text = printed(log) || printed(out);
		const parsed = JSON.parse(text) as {
			buckets?: { name: string }[];
			data?: { buckets?: { name: string }[] };
		};
		const buckets = parsed.buckets ?? parsed.data?.buckets ?? [];
		return buckets.map((bucket) => bucket.name);
	}

	async function readProbe(): Promise<string> {
		out.mockClear();
		await runCf(
			["r2", "objects", "get", "probe", "--bucket-name", "local-bucket", ...local],
			env
		);
		return printed(out);
	}

	it("lists a bucket that --local object commands wrote to", async () => {
		await runCf(
			[
				"r2",
				"objects",
				"put",
				"probe",
				"--bucket-name",
				"local-bucket",
				"--body",
				"sample",
				...local,
			],
			env
		);

		expect(await readProbe()).toBe("sample");
		expect(await listBucketNames()).toContain("local-bucket");
	}, 60_000);

	it("lists a bucket a stopped dev server's Worker wrote to", async () => {
		// Stands in for `cf dev`: a Worker with an R2 binding persisting to the
		// same state directory, without shared storage, as the Vite plugin runs.
		const dev = new Miniflare({
			cf: false,
			resourcePersistencePath: resolve("state", "v3"),
			workers: [
				{
					config: {
						name: "bucket-list-repro",
						compatibilityDate: "2026-01-01",
						manifest: {
							mainModule: "index.mjs",
							modules: {
								"index.mjs": {
									type: "esm",
									contents: `export default {
										async fetch(request, env) {
											await env.R2.put("probe", "sample");
											return new Response("ready");
										},
									};`,
								},
							},
						},
						env: { R2: { type: "r2", name: "local-bucket" } },
					},
				},
			],
		} as ConstructorParameters<typeof Miniflare>[0]);
		try {
			const response = await dev.dispatchFetch("http://localhost/", {
				method: "POST",
			});
			expect(await response.text()).toBe("ready");
		} finally {
			await dev.dispose();
		}

		expect(await readProbe()).toBe("sample");
		expect(await listBucketNames()).toContain("local-bucket");
	}, 60_000);
});
