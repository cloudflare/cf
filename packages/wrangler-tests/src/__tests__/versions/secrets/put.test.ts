import { http, HttpResponse } from "msw";
import { afterEach, describe, it, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { mockConsoleMethods } from "../../helpers/mock-console";
import { clearDialogs, mockPrompt } from "../../helpers/mock-dialogs";
import { useMockIsTTY } from "../../helpers/mock-istty";
import { createFetchResult, msw } from "../../helpers/msw";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

// The target OpenAPI schema classifies `worker-put-script-secret` as SDK-only,
// so cf intentionally has no Worker secret-write CLI leaf.
describe.skip("versions secret put", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();
	afterEach(clearDialogs);

	test("can add a new secret (interactive)", async ({ expect }) => {
		setIsTTY(true);
		mockPrompt({ text: "The secret value to use.", result: "the-secret" });
		const request = mockPutRequest();
		await runWrangler(
			"workers secrets update NEW_SECRET --worker script-name --type secret_text"
		);
		await expect(request).resolves.toMatchObject({
			name: "NEW_SECRET",
			text: "the-secret",
		});
	});

	test("no wrangler configuration warnings shown", async ({ expect }) => {
		const request = mockPutRequest();
		await runWrangler(
			"workers secrets update NEW_SECRET --worker script-name --type secret_text --text the-secret"
		);
		await request;
		expect(std.warn).toBe("");
	});

	test.skip("shows a nice error message when the Worker has no versions", async () => {});

	describe("(non-interactive)", () => {
		test("can add a new secret (non-interactive)", async ({ expect }) => {
			const request = mockPutRequest();
			await runWrangler(
				"workers secrets update NEW_SECRET --worker script-name --type secret_text --text the-secret"
			);
			await expect(request).resolves.toMatchObject({ text: "the-secret" });
		});
	});

	test.skip("can add a new secret, read Worker name from wrangler.toml", async () => {});
	// The generated script-secret operation does not expose version annotations.
	test.todo("can add a new secret with message");
	test.todo("can add a new secret with message + tag");

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

function mockPutRequest() {
	let resolveRequest!: (body: Record<string, unknown>) => void;
	const request = new Promise<Record<string, unknown>>((resolve) => {
		resolveRequest = resolve;
	});
	msw.use(
		http.put(
			"*/accounts/:accountId/workers/scripts/:worker/secrets",
			async ({ request: incoming }) => {
				const body = (await incoming.json()) as Record<string, unknown>;
				resolveRequest(body);
				return HttpResponse.json(
					createFetchResult({ name: body.name, type: body.type })
				);
			},
			{ once: true }
		)
	);
	return request;
}
