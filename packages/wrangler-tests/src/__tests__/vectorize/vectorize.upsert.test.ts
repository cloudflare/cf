import crypto from "node:crypto";
import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { VectorizeVector } from "../../vectorize/types";

describe("dataset upsert", () => {
	const std = mockConsoleMethods();

	runInTempDir();
	mockAccountId();
	mockApiToken();

	const testVectors: VectorizeVector[] = [
		{
			id: "b0daca4a-ffd8-4865-926b-e24800af2a2d",
			values: [0.2331, 1.0125, 0.6131, 0.9421, 0.9661, 0.8121],
			metadata: { text: "She sells seashells by the seashore" },
		},
		{
			id: "a44706aa-a366-48bc-8cc1-3feffd87d548",
			values: [0.2321, 0.8121, 0.6315, 0.6151, 0.4121, 0.1512],
			metadata: { text: "Peter Piper picked a peck of pickled peppers" },
		},
		{
			id: "43cfcb31-07e2-411f-8bf9-f82a95ba8b96",
			values: [0.0515, 0.7512, 0.8612, 0.2153, 0.1521, 0.6812],
			metadata: {
				text: "You know New York, you need New York, you know you need unique New York",
			},
		},
		{
			id: "15cc795d-93d3-416d-9a2a-36fa6fac73da",
			values: [0.8525, 0.7751, 0.6326, 0.1512, 0.9655, 0.6626],
			metadata: { text: "He threw three free throws" },
		},
		{
			id: "15cc795d-93d3-416d-9a2a-36fa6fac73da",
			values: [0.6323, 0.1111, 0.5136, 0.7512, 0.6632, 0.5254],
			metadata: {
				text: "Which witch is which?",
				boo: false,
				num: 100,
				nested: { t: "abcd" },
			},
		},
	];

	// Vectorize v1 endpoint + wrangler's `--deprecated-v1=true` flag have
	// no cf equivalent — cf only targets the v2 endpoint.
	it.skip("should batch uploads in ndjson format for Vectorize v1", async () => {});

	it("should batch uploads in ndjson format for Vectorize", async ({
		expect,
	}) => {
		writeFileSync(
			"vectors.ndjson",
			testVectors.map((v) => JSON.stringify(v)).join(`\n`)
		);

		const mutationId = crypto.randomUUID();

		let insertRequestCount = 0;
		msw.use(
			http.post(
				"*/vectorize/v2/indexes/:indexName/insert",
				async ({ request, params }) => {
					expect(params.indexName).toEqual("my-index");
					expect(request.headers.get("Content-Type")).toEqual(
						"application/x-ndjson"
					);
					const body = await request.text();
					expect(body).toEqual(
						testVectors.map((v) => JSON.stringify(v)).join("\n")
					);
					insertRequestCount++;

					return HttpResponse.json(
						{
							success: true,
							errors: [],
							messages: [],
							result: { mutationId: mutationId },
						},
						{ status: 200 }
					);
				}
			)
		);

		await runWrangler(`vectorize insert my-index --file vectors.ndjson`);

		expect(insertRequestCount).toBe(1);
		expect(
			std.out.replaceAll(mutationId, "00000000-0000-0000-0000-000000000000")
		).toMatchInlineSnapshot(`
			"{
			  "mutationId": "00000000-0000-0000-0000-000000000000"
			}"
		`);
	});

	it("should batch uploads for upsert in ndjson format for Vectorize", async ({
		expect,
	}) => {
		writeFileSync(
			"vectors.ndjson",
			testVectors.map((v) => JSON.stringify(v)).join(`\n`)
		);

		const mutationId = crypto.randomUUID();

		let upsertRequestCount = 0;
		msw.use(
			http.post(
				"*/vectorize/v2/indexes/:indexName/upsert",
				async ({ request, params }) => {
					expect(params.indexName).toEqual("my-index");
					expect(request.headers.get("Content-Type")).toEqual(
						"application/x-ndjson"
					);
					const body = await request.text();
					expect(body).toEqual(
						testVectors.map((v) => JSON.stringify(v)).join("\n")
					);
					upsertRequestCount++;

					return HttpResponse.json(
						{
							success: true,
							errors: [],
							messages: [],
							result: { mutationId: mutationId },
						},
						{ status: 200 }
					);
				}
			)
		);

		await runWrangler(`vectorize upsert my-index --file vectors.ndjson`);

		expect(upsertRequestCount).toBe(1);
		expect(
			std.out.replaceAll(mutationId, "00000000-0000-0000-0000-000000000000")
		).toMatchInlineSnapshot(`
			"{
			  "mutationId": "00000000-0000-0000-0000-000000000000"
			}"
		`);
	});

	// cf has no `--json` flag — every command outputs JSON by default
	// (the `--json`/pretty split was a wrangler concept). The two tests
	// below assert the same default-JSON output as the upload tests
	// above; they're kept for parity with wrangler's coverage of the
	// JSON-output happy path but no longer carry a `--json` flag.
	it("should output valid JSON for insert with --json flag", async ({
		expect,
	}) => {
		writeFileSync(
			"vectors.ndjson",
			testVectors.map((v) => JSON.stringify(v)).join(`\n`)
		);

		const mutationId = crypto.randomUUID();

		msw.use(
			http.post("*/vectorize/v2/indexes/:indexName/insert", async () => {
				return HttpResponse.json(
					{
						success: true,
						errors: [],
						messages: [],
						result: { mutationId: mutationId },
					},
					{ status: 200 }
				);
			})
		);

		await runWrangler(`vectorize insert my-index --file vectors.ndjson`);

		expect(JSON.parse(std.out)).toEqual({ mutationId });
		expect(std.warn).toBe("");
		expect(std.err).toBe("");
	});

	it("should output valid JSON for upsert with --json flag", async ({
		expect,
	}) => {
		writeFileSync(
			"vectors.ndjson",
			testVectors.map((v) => JSON.stringify(v)).join(`\n`)
		);

		const mutationId = crypto.randomUUID();

		msw.use(
			http.post("*/vectorize/v2/indexes/:indexName/upsert", async () => {
				return HttpResponse.json(
					{
						success: true,
						errors: [],
						messages: [],
						result: { mutationId: mutationId },
					},
					{ status: 200 }
				);
			})
		);

		await runWrangler(`vectorize upsert my-index --file vectors.ndjson`);

		expect(JSON.parse(std.out)).toEqual({ mutationId });
		expect(std.warn).toBe("");
		expect(std.err).toBe("");
	});

	// The generator's `--file` codepath now reads through
	// `readFileForFlag` (lib/input-validation.ts), which wraps the bare
	// `readFileSync` with a friendly error and preserves the
	// user-supplied path (no resolved-cwd leak). Previously cf leaked a
	// raw `ENOENT: ... open '<absolute-cwd>/<path>'` node:fs stack.
	// See `test_bugs/vectorize-file-bare-enoent.md`.
	it("should reject an invalid file param", async ({ expect }) => {
		await expect(
			runWrangler("vectorize upsert my-index --file invalid_vectors.ndjson")
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Cannot read invalid or empty file: invalid_vectors.ndjson]`
		);
	});

	// `readFileForFlag` also rejects empty files up-front instead of
	// sending a zero-byte body that the API 500s on (cf previously had
	// no client-side check). See `test_bugs/vectorize-file-empty-no-check.md`.
	it("should reject an empty file param", async ({ expect }) => {
		writeFileSync("empty_vectors.ndjson", "");

		await expect(
			runWrangler("vectorize upsert my-index --file empty_vectors.ndjson")
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Cannot read invalid or empty file: empty_vectors.ndjson]`
		);
	});
});
