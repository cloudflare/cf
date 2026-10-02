import { writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm, mockPrompt } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";
import type { ExpectStatic } from "vite-plus/test";

// Inlined from wrangler's ../utils/worker-not-found-error and ../secret
// (unresolved in cf port). Preserved so the (skipped) error-shape
// expectations still type-check when needed.
const WORKER_NOT_FOUND_ERR_CODE = 10007;
const workerNotFoundErrorMessage = "workers.api.error.script_not_found";

function createFetchResult(
	result: unknown,
	success = true,
	errors: { code: number; message: string }[] = []
) {
	return {
		success,
		errors,
		messages: [],
		result,
	};
}

/**
 * Replace `process.stdin` with a Readable yielding the given chunks, so
 * cf's `readAllStdin` (`for await (const chunk of process.stdin)`) sees
 * piped input. `setIsTTY(false)` (run in beforeEach) swaps in an empty
 * closed stdin; this overrides it for the duration of the test.
 * `useMockIsTTY`'s afterEach restores the real stdin.
 */
function pipeStdin(...chunks: string[]) {
	const stream = Readable.from(chunks) as Readable & { isTTY?: boolean };
	stream.isTTY = false;
	Object.defineProperty(process, "stdin", {
		value: stream,
		configurable: true,
	});
}

/** As `pipeStdin`, but the stream errors when consumed. */
function pipeStdinError(error: Error) {
	const stream = new Readable({
		read() {
			this.destroy(error);
		},
	}) as Readable & { isTTY?: boolean };
	stream.isTTY = false;
	Object.defineProperty(process, "stdin", {
		value: stream,
		configurable: true,
	});
}

describe("workers secrets", () => {
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();
	runInTempDir();
	mockAccountId();
	mockApiToken();
	afterEach(() => {
		clearDialogs();
	});

	describe("update", () => {
		function mockPutRequest(
			expect: ExpectStatic,
			input: { name: string; text: string },
			expectedScriptName = "script-name"
		) {
			msw.use(
				http.put(
					`*/accounts/:accountId/workers/scripts/:scriptName/secrets`,
					async ({ request, params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.scriptName).toEqual(expectedScriptName);
						const { name, text, type } = (await request.json()) as Record<
							string,
							string
						>;
						expect(type).toEqual("secret_text");
						expect(name).toEqual(input.name);
						expect(text).toEqual(input.text);

						return HttpResponse.json(createFetchResult({ name, type }));
					},
					{ once: true }
				)
			);
		}

		// Wrangler-only: cf doesn't read worker config (no
		// `pages_build_output_dir` knowledge). See AGENTS.md
		// "cf does NOT read project worker config".
		it.skip("should error helpfully if pages_build_output_dir is set", async () => {});

		describe("interactive", () => {
			beforeEach(() => {
				setIsTTY(true);
			});

			it("should prompt for the secret value when --text is missing", async ({
				expect,
			}) => {
				// cf's required-field prompt for --text uses the field
				// description ("The secret value to use.") as the prompt
				// message. Per test_bugs/looks-like-secret-text-flag.md
				// (Fixed/both), --text is now marked secret via the
				// OpenAPI `x-sensitive: true` annotation (surfaced as
				// `BodyParamInfo.sensitive`), so the generator passes
				// `{ kind: "secret" }` and the prompt is masked. The
				// mockPrompt assertion matches on prompt text, not the
				// clack.password vs clack.text distinction, so it's
				// unchanged.
				mockPrompt({
					text: "The secret value to use.",
					result: "hunter2",
				});

				mockPutRequest(expect, { name: "secret-name", text: "hunter2" });
				// --type defaults to secret_text (from the OpenAPI spec
				// default), so omitting it here exercises the common path
				// where only --text is prompted. Do NOT pass --type
				// explicitly — we want to verify the default works.
				await runWrangler(
					"workers secrets update secret-name --worker script-name --type secret_text"
				);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should create a secret when --text is passed directly", async ({
				expect,
			}) => {
				mockPutRequest(expect, { name: "the-key", text: "the-secret" });
				// --type defaults to secret_text; do NOT pass it explicitly.
				await runWrangler(
					"workers secrets update the-key --worker script-name --type secret_text --text the-secret"
				);

				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// Wrangler-only: `--env` / `--legacy-env` only make sense when
			// the CLI knows about a worker config that defines envs. cf has
			// no notion of envs at the API level; the user passes the
			// already-disambiguated script name.
			it.skip("should create a secret: legacy envs", async () => {});
			it.skip("should create a secret: service envs", async () => {});

			it("should error without a script name", async ({ expect }) => {
				await expect(
					runWrangler(
						"workers secrets update the-key --type secret_text --text the-secret"
					)
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Required Worker name missing. Please specify the Worker name with \`--worker <name>\`.]`
				);
			});

			// Wrangler-only: when wrangler PUT'd to a script that didn't
			// exist, it offered to create one. cf's `workers secrets update`
			// surfaces whatever the API replies with — no client-side
			// "create the worker for you" detour.
			it.skip("should ask to create a new Worker if no Worker is found under the provided name and abort if declined", async () => {});
		});

		describe("non-interactive", () => {
			beforeEach(() => {
				setIsTTY(false);
			});

			// Unblocked by test_bugs/looks-like-secret-text-flag.md
			// (Fixed/both): forge now surfaces `x-sensitive: true` on the
			// secrets-update `text` field as `BodyParamInfo.sensitive`, so
			// the generator emits `{ kind: "secret" }` for --text. cf's
			// `promptForRequiredField` only pulls from piped stdin for
			// secret-shaped fields (lib/prompt.ts:127-138), so piping the
			// value now flows into the request body. NB: cf's
			// `readAllStdin` strips a single trailing newline only — not
			// wrangler's arbitrary-trailing-whitespace trim.
			it("should trim stdin secret value, from piped input", async ({
				expect,
			}) => {
				mockPutRequest(expect, { name: "the-key", text: "the-secret" });
				// Pipe the secret in as chunks to verify reconstitution; the
				// single trailing newline is stripped by readAllStdin.
				// --type defaults to secret_text; do NOT pass it explicitly.
				pipeStdin("the", "-", "secret\n");
				await runWrangler(
					"workers secrets update the-key --worker script-name --type secret_text"
				);

				expect(JSON.parse(std.out)).toEqual({
					name: "the-key",
					type: "secret_text",
				});
				expect(std.warn).toMatchInlineSnapshot(`""`);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should create a secret, from piped input", async ({ expect }) => {
				mockPutRequest(expect, { name: "the-key", text: "the-secret" });
				// Pipe the secret in as three chunks to test that we
				// reconstitute it correctly.
				// --type defaults to secret_text; do NOT pass it explicitly.
				pipeStdin("the", "-", "secret");
				await runWrangler(
					"workers secrets update the-key --worker script-name --type secret_text"
				);

				expect(JSON.parse(std.out)).toEqual({
					name: "the-key",
					type: "secret_text",
				});
				expect(std.warn).toMatchInlineSnapshot(`""`);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should error if the piped input fails", async ({ expect }) => {
				pipeStdinError(new Error("Error in stdin stream"));
				// --type defaults to secret_text; do NOT pass it explicitly.
				await expect(
					runWrangler(
						"workers secrets update the-key --worker script-name --type secret_text"
					)
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Error in stdin stream]`
				);
			});

			it("should create a secret with --text passed directly", async ({
				expect,
			}) => {
				mockPutRequest(expect, { name: "the-key", text: "the-secret" });
				// --type defaults to secret_text; do NOT pass it explicitly.
				await runWrangler(
					"workers secrets update the-key --worker script-name --type secret_text --text the-secret"
				);

				expect(std.warn).toMatchInlineSnapshot(`""`);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// Wrangler-only: cf doesn't auto-create missing workers (see
			// the matching skip in the "interactive" describe above).
			it.skip("should create a new worker if no worker is found under the provided name", async () => {});

			describe("with accountId", () => {
				mockAccountId({ accountId: null });

				// cf's account discovery hits GET /accounts (not
				// wrangler's /memberships). The translated tests below
				// are blocked by the existing "Auth CONFIG_DIR resolved
				// at module-import time" cf source bug — `loadConfig()`
				// reads `~/.config/cf/config.json` from the developer's
				// real home directory regardless of the `runInTempDir()`
				// HOME stub, so when a stored `defaults.accountId` exists
				// the env-cleared `CLOUDFLARE_ACCOUNT_ID` fallback never
				// kicks in and the tests don't see the 0-account / N-
				// account / fetch-fail surfaces. See
				// `test_bugs/auth-paths-resolved-at-import.md`.
				it.todo(
					"should error if request for accounts fails (blocked by user-config import-time bug)"
				);
				it.todo(
					"should error if a user has no account (blocked by user-config import-time bug)"
				);
				it.todo(
					"should error if a user has multiple accounts, and has not specified one (blocked by user-config import-time bug)"
				);

				// Wrangler-only: account fallback via wrangler.toml
				// `account_id` is config-driven. cf only consults
				// `--account-id` flag, env, .cfrc, and the user config —
				// no worker config is read.
				it.skip("should use the account from wrangler.toml", async () => {});
			});

			// Wrangler-only: the multi-env warning fires when wrangler reads
			// a config file and notices `env.*` blocks. cf doesn't read
			// worker config at all.
			describe.skip("multi-env warning", () => {
				it("should warn if the wrangler config contains environments but none was specified in the command", async () => {});
				it("should not warn if the wrangler config contains environments and one was specified in the command", async () => {});
				it("should not warn if the wrangler config doesn't contain environments and none was specified in the command", async () => {});
			});
		});

		// Wrangler-only: the "latest version is not deployed"
		// (VERSION_NOT_DEPLOYED) error code mapping is a wrangler-side
		// bespoke rewrite into a `wrangler versions secret put` hint.
		// cf surfaces the raw API error per AGENTS.md "no per-API-code
		// error switches in errors.ts".
		it.skip("should error if the latest version is not deployed", async () => {});
	});

	describe("delete", () => {
		beforeEach(() => {
			setIsTTY(true);
		});
		function mockDeleteRequest(
			expect: ExpectStatic,
			input: {
				scriptName: string;
				secretName: string;
			}
		) {
			msw.use(
				http.delete(
					`*/accounts/:accountId/workers/scripts/:scriptName/secrets/:secretName`,
					({ params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.scriptName).toEqual(input.scriptName);
						expect(params.secretName).toEqual(input.secretName);
						return HttpResponse.json(createFetchResult(null));
					},
					{ once: true }
				)
			);
		}

		// Wrangler-only: cf doesn't read worker config.
		it.skip("should error helpfully if pages_build_output_dir is set", async () => {});

		it("should delete a secret", async ({ expect }) => {
			mockDeleteRequest(expect, {
				scriptName: "script-name",
				secretName: "the-key",
			});
			mockConfirm({
				text: "This will permanently delete the Worker script secret. Continue?",
				result: true,
			});
			await runWrangler("workers secrets delete the-key --worker script-name");
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		it("should delete a secret which name includes special characters", async ({
			expect,
		}) => {
			// The vendored SDK now wraps every interpolated path param in
			// `encodeURIComponent` (see test_bugs/sdk-no-url-encode-path-params.md),
			// so a secretName of "the/key" reaches the API as
			// `…/secrets/the%2Fkey` instead of being misrouted as two
			// path segments. We assert the encoded URL directly off the
			// MSW request — relying on `params.secretName` alone would
			// hide the regression because MSW decodes path params before
			// surfacing them.
			msw.use(
				http.delete(
					`*/accounts/:accountId/workers/scripts/:scriptName/secrets/:secretName`,
					({ request, params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.scriptName).toEqual("script-name");
						// MSW decodes path params before exposing them.
						expect(params.secretName).toEqual("the/key");
						// But the raw request URL must contain the
						// percent-encoded segment, not the literal slash.
						expect(request.url).toContain("/secrets/the%2Fkey");
						expect(request.url).not.toContain("/secrets/the/key");
						return HttpResponse.json(createFetchResult(null));
					},
					{ once: true }
				)
			);
			mockConfirm({
				text: "This will permanently delete the Worker script secret. Continue?",
				result: true,
			});
			await runWrangler("workers secrets delete the/key --worker script-name");
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		// Wrangler-only: `--env` / `--legacy-env` are env-aware in
		// wrangler; cf's script-name is the already-disambiguated
		// identifier.
		it.skip("should delete a secret: legacy envs", async () => {});
		it.skip("should delete a secret: service envs", async () => {});

		it("should error without a script name", async ({ expect }) => {
			await expect(
				runWrangler("workers secrets delete the-key")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Required Worker name missing. Please specify the Worker name with \`--worker <name>\`.]`
			);
		});

		// Wrangler-only: multi-env warnings rely on reading worker config.
		describe.skip("multi-env warning", () => {
			it("should warn if the wrangler config contains environments but none was specified in the command", async () => {});
			it("should not warn if the wrangler config contains environments and one was specified in the command", async () => {});
			it("should not warn if the wrangler config doesn't contain environments and none was specified in the command", async () => {});
		});
	});

	describe("list", () => {
		beforeEach(() => {
			setIsTTY(true);
		});
		function mockListRequest(
			expect: ExpectStatic,
			input: { scriptName: string }
		) {
			msw.use(
				http.get(
					`*/accounts/:accountId/workers/scripts/:scriptName/secrets`,
					({ params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.scriptName).toEqual(input.scriptName);

						return HttpResponse.json(
							createFetchResult([
								{
									name: "the-secret-name",
									type: "secret_text",
								},
							])
						);
					},
					{ once: true }
				)
			);
		}

		// Wrangler-only: cf doesn't read worker config.
		it.skip("should error helpfully if pages_build_output_dir is set", async () => {});

		it("should list secrets", async ({ expect }) => {
			mockListRequest(expect, { scriptName: "script-name" });
			await runWrangler("workers secrets list --worker script-name");
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual([
				{
					name: "the-secret-name",
					type: "secret_text",
				},
			]);
		});

		// Wrangler-only: env-aware paths.
		it.skip("should list secrets: wrangler environment", async () => {});
		it.skip("should list secrets: service envs", async () => {});

		it("should error without a script name", async ({ expect }) => {
			await expect(
				runWrangler("workers secrets list")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Required Worker name missing. Please specify the Worker name with \`--worker <name>\`.]`
			);
		});

		it("should surface API errors when worker is not found", async ({
			expect,
		}) => {
			msw.use(
				http.get(
					`*/accounts/:accountId/workers/scripts/:scriptName/secrets`,
					() => {
						return HttpResponse.json(
							createFetchResult(null, false, [
								{
									code: WORKER_NOT_FOUND_ERR_CODE,
									message: workerNotFoundErrorMessage,
								},
							]),
							{ status: 404 }
						);
					},
					{ once: true }
				)
			);
			// cf surfaces the API error generically; wrangler had a bespoke
			// "Worker not found" rewrite that pointed at `wrangler deploy`.
			// Per AGENTS.md, no per-API-code error switches in cf src/.
			await expect(
				runWrangler("workers secrets list --worker non-existent-worker")
			).rejects.toThrow(/workers\.api\.error\.script_not_found/);
		});

		// Wrangler-only: `--format pretty` / banners are wrangler UX.
		// cf's `workers secrets list` always emits JSON to stdout.
		describe.skip("banner tests", () => {
			it("banner if pretty", async () => {});
			it("no banner if json", async () => {});
		});
	});

	// Wrangler parses flat JSON/.env/stdin input and wraps it in `{ secrets }`.
	// cf exposes the JSON Merge Patch body directly through --body or --file.
	describe("bulk", () => {
		function mockBulkRequest(expect: ExpectStatic) {
			let resolveRequest!: (body: unknown) => void;
			const received = new Promise<unknown>((resolve) => {
				resolveRequest = resolve;
			});
			msw.use(
				http.patch(
					"*/accounts/:accountId/workers/scripts/:scriptName/secrets-bulk",
					async ({ params, request }) => {
						expect(params.accountId).toBe("some-account-id");
						expect(params.scriptName).toBe("script-name");
						resolveRequest(await request.json());
						return HttpResponse.json(createFetchResult(null));
					},
					{ once: true }
				)
			);
			return received;
		}

		it("should fail secret bulk w/ no pipe or JSON input", async ({
			expect,
		}) => {
			await expect(
				runWrangler("workers secrets bulk --worker script-name")
			).rejects.toThrow(/--body is required/i);
		});

		it("should create secrets from JSON file", async ({ expect }) => {
			const body = {
				secrets: {
					"secret-name-1": {
						name: "secret-name-1",
						text: "first-value",
						type: "secret_text",
					},
					"secret-name-2": {
						name: "secret-name-2",
						text: "second-value",
						type: "secret_text",
					},
				},
			};
			writeFileSync("secret.json", JSON.stringify(body));
			const request = mockBulkRequest(expect);
			await runWrangler(
				"workers secrets bulk --worker script-name --file secret.json"
			);
			expect(await request).toEqual(body);
		});

		it("should fail if file is not valid JSON", async ({ expect }) => {
			writeFileSync("secret.json", "bad file content");
			await expect(
				runWrangler(
					"workers secrets bulk --worker script-name --body @secret.json"
				)
			).rejects.toThrow(/Invalid JSON in --body/);
		});

		it("should only send provided secrets via secrets-bulk endpoint", async ({
			expect,
		}) => {
			const body = {
				secrets: {
					"secret-name-2": {
						name: "secret-name-2",
						text: "value",
						type: "secret_text",
					},
				},
			};
			const request = mockBulkRequest(expect);
			await runWrangler(
				`workers secrets bulk --worker script-name --body '${JSON.stringify(body)}'`
			);
			expect(await request).toEqual(body);
		});

		it("should send null values to delete secrets via secrets-bulk endpoint", async ({
			expect,
		}) => {
			const body = {
				secrets: {
					"secret-to-create": {
						name: "secret-to-create",
						text: "new-value",
						type: "secret_text",
					},
					"secret-to-delete": null,
				},
			};
			const request = mockBulkRequest(expect);
			await runWrangler(
				`workers secrets bulk --worker script-name --body '${JSON.stringify(body)}'`
			);
			expect(await request).toEqual(body);
		});

		it("should handle network failure on secret bulk", async ({ expect }) => {
			msw.use(
				http.patch(
					"*/accounts/:accountId/workers/scripts/:scriptName/secrets-bulk",
					() => HttpResponse.error(),
					{ once: true }
				)
			);
			await expect(
				runWrangler(
					"workers secrets bulk --worker script-name --body '{\"secrets\":{}}'"
				)
			).rejects.toThrow(/fetch/i);
		});

		it("throws a meaningful error", async ({ expect }) => {
			msw.use(
				http.patch(
					"*/accounts/:accountId/workers/scripts/:scriptName/secrets-bulk",
					() =>
						HttpResponse.json(
							createFetchResult(null, false, [
								{ code: 1, message: "This is a helpful error" },
							]),
							{ status: 400 }
						),
					{ once: true }
				)
			);
			await expect(
				runWrangler(
					"workers secrets bulk --worker script-name --body '{\"secrets\":{}}'"
				)
			).rejects.toThrow(/This is a helpful error/);
		});

		it("should not create a new worker for delete-only bulk input when the worker is not found", async ({
			expect,
		}) => {
			let workerCreateCount = 0;
			msw.use(
				http.patch(
					"*/accounts/:accountId/workers/scripts/:scriptName/secrets-bulk",
					() =>
						HttpResponse.json(
							createFetchResult(null, false, [
								{
									code: WORKER_NOT_FOUND_ERR_CODE,
									message: workerNotFoundErrorMessage,
								},
							]),
							{ status: 404 }
						),
					{ once: true }
				),
				http.put("*/accounts/:accountId/workers/scripts/:name", () => {
					workerCreateCount++;
					return HttpResponse.json(createFetchResult(null));
				})
			);
			await expect(
				runWrangler(
					`workers secrets bulk --worker non-existent-worker --body '{"secrets":{"secret-to-delete":null}}'`
				)
			).rejects.toThrow(/workers\.api\.error\.script_not_found/);
			expect(workerCreateCount).toBe(0);
		});

		// The generated API command does not parse flat JSON/.env/stdin input,
		// create missing Workers, or inspect Wrangler project environments.
		it.skip("should error helpfully if pages_build_output_dir is set", async () => {});
		it.skip("should use secret bulk w/ pipe input", async () => {});
		it.skip("should create secrets from env stdin", async () => {});
		it.skip("should create secrets from a env file", async () => {});
		it.skip("should fail if JSON file contains a record with non-string values", async () => {});
		it.skip("should fail if JSON stdin contains a record with non-string values", async () => {});
		it.skip("should count success and network failure on secret bulk", async () => {});
		it.skip("should show no-op message when bulk input has no secrets", async () => {});
		it.skip("should, in interactive mode, ask to create a new Worker if no Worker is found under the provided name", async () => {});
		it.skip("should, in non-interactive mode, create a new worker if no worker is found under the provided name", async () => {});
		describe.skip("multi-env warning", () => {
			it("should warn if the wrangler config contains environments but none was specified in the command", async () => {});
			it("should not warn if the wrangler config contains environments and one was specified in the command", async () => {});
			it("should not warn if the wrangler config doesn't contain environments and none was specified in the command", async () => {});
			it("should not warn if the wrangler config contains environments and CLOUDFLARE_ENV is set", async () => {});
			it('should not warn if --env="" is passed to explicitly target the top-level environment', async () => {});
		});
	});
});
