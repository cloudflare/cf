import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { describe, it, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { mockConsoleMethods } from "../../helpers/mock-console";
import { createFetchResult, msw } from "../../helpers/msw";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

// The target OpenAPI schema classifies `worker-patch-script-secrets-bulk` as
// SDK-only, so cf intentionally has no Worker bulk-secret CLI leaf.
describe.skip("versions secret bulk", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	test("should fail secret bulk w/ no pipe or JSON input", async ({
		expect,
	}) => {
		await expect(
			runWrangler("workers secrets bulk-edit --worker script-name")
		).rejects.toThrow(/body is required/i);
	});

	test("uploading secrets from json file", async ({ expect }) => {
		writeFileSync(
			"secrets.json",
			JSON.stringify({ SECRET: { type: "secret_text", text: "value" } })
		);
		const request = mockBulkRequest();
		await runWrangler(
			"workers secrets bulk-edit --worker script-name --file secrets.json"
		);
		await expect(request).resolves.toEqual({
			SECRET: { type: "secret_text", text: "value" },
		});
	});

	// dotenv parsing is a Wrangler input-format convenience rather than an
	// API behavior; cf's raw generated endpoint accepts JSON Merge Patch.
	test.skip("uploading secrets from env file", async () => {});

	test("no wrangler configuration warnings shown", async ({ expect }) => {
		writeFileSync("wrangler.json", JSON.stringify({ invalid_field: true }));
		const request = mockBulkRequest();
		await runWrangler(
			"workers secrets bulk-edit --worker script-name --body '{\"SECRET\":null}'"
		);
		await request;
		expect(std.warn).toBe("");
	});

	// The generated raw-body command does not currently consume an omitted
	// body from stdin, though cf should support the same non-interactive flow.
	test.todo("uploading secrets from stdin");
	test.skip("uploading secrets from env stdin", async () => {});
	// The raw file path currently forwards malformed JSON to the API rather
	// than rejecting it locally.
	test.todo("should error on invalid json file");
	test.todo("should error on invalid json stdin");
	// Wrangler accepted a flat name-to-string record; the API endpoint takes
	// structured secret objects, so this particular client validation does not apply.
	test.skip("should error on json stdin with non-string values", async () => {});
	// The direct bulk API is not coupled to an existing Worker version and cf
	// intentionally has no per-code Wrangler hint layer.
	test.skip("shows a nice error message when the Worker has no versions", async () => {});

	describe("multi-env warning", () => {
		it.skip(
			"should warn if the wrangler config contains environments but none was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config contains environments and one was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config doesn't contain environments and none was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config contains environments and CLOUDFLARE_ENV is set"
		);
		it.skip(
			'should not warn if --env="" is passed to explicitly target the top-level environment'
		);
	});
});

function mockBulkRequest() {
	let resolveRequest!: (body: unknown) => void;
	const request = new Promise<unknown>((resolve) => {
		resolveRequest = resolve;
	});
	msw.use(
		http.patch(
			"*/accounts/:accountId/workers/scripts/:worker/secrets-bulk",
			async ({ request: incoming }) => {
				resolveRequest(await incoming.json());
				return HttpResponse.json(
					createFetchResult({ version_id: "version-id" })
				);
			},
			{ once: true }
		)
	);
	return request;
}
