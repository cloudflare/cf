import { http, HttpResponse } from "msw";
import { beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";
import type { ExpectStatic } from "vite-plus/test";

describe("delete", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	const std = mockConsoleMethods();

	it("should delete an entire service by name", async ({ expect }) => {
		mockConfirm({
			text: `This will permanently delete the Worker and its associated versions and deployments. Continue?`,
			result: true,
		});
		mockDeleteWorkerRequest(expect, { name: "my-script" });
		await runWrangler("workers delete my-script");

		expect(std.err).toMatchInlineSnapshot(`""`);
		expect(std.out).toMatchInlineSnapshot(`""`);
	});

	it("should delete a service using positional name argument", async ({
		expect,
	}) => {
		mockConfirm({
			text: `This will permanently delete the Worker and its associated versions and deployments. Continue?`,
			result: true,
		});
		mockDeleteWorkerRequest(expect, { name: "positional-script" });
		await runWrangler("workers delete positional-script");

		expect(std.err).toMatchInlineSnapshot(`""`);
		expect(std.out).toMatchInlineSnapshot(`""`);
	});

	// wrangler picks `--name <cli>` over the `name` from wrangler.toml.
	// cf doesn't read worker config — see AGENTS.md "cf does NOT read
	// project worker config" — so the precedence test has no cf
	// equivalent.
	it.skip("should use positional name argument over the name from the Wrangler config file", async () => {});

	// wrangler's `delete` (no flag) reads the worker name from
	// wrangler.toml. cf doesn't read worker config, so this path has
	// no cf equivalent.
	it.skip("should delete a script by configuration", async () => {});

	it("shouldn't delete a service when doing a --dry-run", async ({
		expect,
	}) => {
		await runWrangler("workers delete xyz --dry-run");

		expect(std.err).toMatchInlineSnapshot(`""`);
		expect(std.out).toMatchInlineSnapshot(`
			"{
			  "command": "cf workers delete",
			  "method": "DELETE",
			  "url": "https://api.cloudflare.com/client/v4/accounts/some-account-id/workers/workers/xyz",
			  "pathParams": {
			    "worker-id": "xyz"
			  },
			  "query": {},
			  "bodyKind": "none"
			}"
		`);
	});

	it('shouldn\'t delete when the user says "no"', async ({ expect }) => {
		mockConfirm({
			text: `This will permanently delete the Worker and its associated versions and deployments. Continue?`,
			result: false,
		});

		await runWrangler("workers delete xyz");

		expect(std.err).toMatchInlineSnapshot(`""`);
		expect(std.out).toMatchInlineSnapshot(`""`);
	});

	// wrangler's `delete` auto-deletes Workers Sites KV namespaces
	// (`__<script>-workers_sites_assets` / `_preview`) associated with
	// the worker. cf's `workers delete` is a plain DELETE on the Worker
	// endpoint with no Sites-aware bookkeeping, so this
	// behaviour has no cf equivalent. Workers Sites is also being sunset
	// in favour of static assets.
	it.skip("should delete a site namespace associated with a worker", async () => {});
	it.skip("should delete a site namespace associated with a worker, including it's preview namespace", async () => {});

	// `pages_build_output_dir` lives in wrangler.toml and only wrangler
	// reads it. cf doesn't parse worker config, so the "ran a Workers
	// command in a Pages project" guard is wrangler-only.
	it.skip("should error helpfully if pages_build_output_dir is set", async () => {});

	describe("force deletes", () => {
		// wrangler's `delete` queried `/workers/scripts/:name/references`
		// and `/workers/tails/by-consumer/:name` to surface a second
		// confirmation listing every dependent worker / Pages function /
		// tail before passing `?force=true` to the API. cf's
		// `workers delete` is a plain DELETE with no pre-flight dependency
		// walk. Its `--force` flag only skips cf's standard confirmation;
		// the endpoint already deletes the Worker's associated resources.
		// The wrangler-side dependency UX has no cf equivalent.
		it.skip("should prompt for extra confirmation when service is depended on and use force", async () => {});
		it.skip("should not delete when extra confirmation to use force is denied", async () => {});
		it.skip("should prompt for extra confirmation when worker is used by a Pages function", async () => {});
		it.skip("should include Pages function in confirmation when combined with other dependencies", async () => {});

		it("should not require confirmation when --force is used", async ({
			expect,
		}) => {
			mockDeleteWorkerRequest(expect, { name: "test-name" });
			await runWrangler("workers delete test-name --force");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(std.out).toMatchInlineSnapshot(`""`);
		});
	});
});

/** Create a mock handler for the request to delete a worker script. */
function mockDeleteWorkerRequest(
	expect: ExpectStatic,
	options: {
		name?: string;
	} = {}
) {
	const { name } = options;
	msw.use(
		http.delete(
			"*/accounts/:accountId/workers/workers/:workerId",
			({ params }) => {
				expect(params.accountId).toEqual("some-account-id");
				expect(params.workerId).toEqual(`${name ?? "test-name"}`);

				return HttpResponse.json(
					{
						success: true,
						errors: [],
						messages: [],
						result: null,
					},
					{ status: 200 }
				);
			},
			{ once: true }
		)
	);
}
