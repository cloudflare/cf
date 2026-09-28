import { http, HttpResponse } from "msw";
import { afterEach, describe, it, test } from "vitest";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { mockConsoleMethods } from "../../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../../helpers/mock-dialogs";
import { useMockIsTTY } from "../../helpers/mock-istty";
import { createFetchResult, msw } from "../../helpers/msw";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

describe("versions secret delete", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();
	afterEach(clearDialogs);

	test("can delete a new secret (interactive)", async ({ expect }) => {
		setIsTTY(true);
		const request = mockDeleteRequest();
		mockConfirm({
			text: "This will permanently delete the Worker script secret. Continue?",
			result: true,
		});
		await runWrangler("workers secrets delete SECRET --worker script-name");
		await expect(request).resolves.toBeUndefined();
	});

	test("can delete a secret (non-interactive)", async ({ expect }) => {
		const request = mockDeleteRequest();
		await runWrangler(
			"workers secrets delete SECRET --worker script-name --force"
		);
		await expect(request).resolves.toBeUndefined();
	});

	test.skip("can delete a secret reading Worker name from wrangler.toml", async () => {});

	test("no wrangler configuration warnings shown", async ({ expect }) => {
		const request = mockDeleteRequest();
		await runWrangler(
			"workers secrets delete SECRET --worker script-name --force"
		);
		await request;
		expect(std.warn).toBe("");
	});

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

function mockDeleteRequest() {
	let resolveRequest!: () => void;
	const request = new Promise<void>((resolve) => {
		resolveRequest = resolve;
	});
	msw.use(
		http.delete(
			"*/accounts/:accountId/workers/scripts/:worker/secrets/:secret",
			() => {
				resolveRequest();
				return HttpResponse.json(createFetchResult(null));
			},
			{ once: true }
		)
	);
	return request;
}
