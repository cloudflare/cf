import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { mockProcess } from "../helpers/mock-process";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { KeyValue, NamespaceKeyInfo } from "../../kv/helpers";
import type { ExpectStatic } from "vitest";

describe("kv", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	const std = mockConsoleMethods();
	const proc = mockProcess();

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	describe("key", () => {
		describe("put", () => {
			function mockKeyPutRequest(
				expect: ExpectStatic,
				expectedNamespaceId: string,
				expectedKV: KeyValue
			) {
				const requests = { count: 0 };
				msw.use(
					http.put(
						"*/accounts/:accountId/storage/kv/namespaces/:namespaceId/values/:key",
						async ({ request, params }) => {
							const url = new URL(request.url);

							requests.count++;
							const { accountId, namespaceId, key } = params;
							expect(accountId).toEqual("some-account-id");
							expect(namespaceId).toEqual(expectedNamespaceId);
							expect(encodeURIComponent(key as string)).toEqual(expectedKV.key);
							if (expectedKV.expiration !== undefined) {
								expect(url.searchParams.get("expiration")).toEqual(
									`${expectedKV.expiration}`
								);
							} else {
								expect(url.searchParams.has("expiration")).toBe(false);
							}
							if (expectedKV.expiration_ttl) {
								expect(url.searchParams.get("expiration_ttl")).toEqual(
									`${expectedKV.expiration_ttl}`
								);
							} else {
								expect(url.searchParams.has("expiration_ttl")).toBe(false);
							}
							if (expectedKV.metadata !== undefined) {
								const contentType = request.headers.get("content-type");
								expect(contentType).toContain("multipart/form-data");
								const formData = await request.formData();
								const metadata = formData.get("metadata");
								expect(metadata).toEqual(JSON.stringify(expectedKV.metadata));
							}
							return HttpResponse.json(createFetchResult(null), {
								status: 200,
							});
						}
					)
				);
				return requests;
			}

			it("should put a key in a given namespace specified by namespace-id", async ({
				expect,
			}) => {
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "my-key",
					value: "my-value",
				});

				await runWrangler(
					"kv keys put my-key --namespace-id some-namespace-id --body my-value"
				);

				expect(requests.count).toEqual(1);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// `kv keys put --body` interpolates the key into a raw path
			// passed to the SDK's generic `client.put(path)` (the kv-values
			// endpoint takes an octet-stream body, so it bypasses the typed
			// resource method). The generator now percent-encodes the
			// interpolated path segments on that raw branch, matching the
			// typed SDK — a key like `/my-key` reaches the API as
			// `%2Fmy-key` instead of producing an extra path segment.
			// Fixed: test_bugs/generator-raw-path-no-url-encode.md
			it("should encode the key in the api request to put a value", async ({
				expect,
			}) => {
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "%2Fmy-key",
					value: "my-value",
				});

				await runWrangler(
					"kv keys put /my-key --namespace-id some-namespace-id --body my-value"
				);

				expect(requests.count).toEqual(1);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// `--binding <name>` resolves a namespace id from the local
			// wrangler.toml. cf doesn't read worker config, so the entire
			// --binding flow has no cf equivalent.
			it.skip("should put a key in a given namespace specified by binding", async () => {});
			it.skip("should put a key in a given preview namespace specified by binding", async () => {});
			it.skip("should put a key to the specified environment in a given namespace", async () => {});

			it("should add expiration and ttl properties when putting a key", async ({
				expect,
			}) => {
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "my-key",
					value: "my-value",
					expiration: 10,
					expiration_ttl: 20,
				});

				await runWrangler(
					"kv keys put my-key --namespace-id some-namespace-id --body my-value --expiration 10 --expiration-ttl 20"
				);

				expect(requests.count).toEqual(1);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should put a key with a value loaded from a given path", async ({
				expect,
			}) => {
				const buf = Buffer.from("file-contents", "utf-8");
				writeFileSync("foo.txt", buf);
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "my-key",
					value: buf,
				});
				await runWrangler(
					"kv keys put my-key --namespace-id some-namespace-id --file foo.txt"
				);
				expect(std.err).toMatchInlineSnapshot(`""`);
				expect(requests.count).toEqual(1);
			});

			it("should put a key with a binary value loaded from a given path", async ({
				expect,
			}) => {
				const buf = Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAiSURBVHgB7coxEQAACMPAgH/PgAM6dGwu49fA/deIBXrgAj2cAhIFT4QxAAAAAElFTkSuQmCC",
					"base64"
				);
				writeFileSync("test.png", buf);
				const requests = mockKeyPutRequest(expect, "another-namespace-id", {
					key: "my-key",
					value: buf,
				});
				await runWrangler(
					"kv keys put my-key --namespace-id another-namespace-id --file test.png"
				);
				expect(std.err).toMatchInlineSnapshot(`""`);
				expect(requests.count).toEqual(1);
			});

			it("should put a key with metadata", async ({ expect }) => {
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "dKey",
					value: "dVal",
					metadata: {
						mKey: "mValue",
					},
				});
				await runWrangler(
					`kv keys put dKey --namespace-id some-namespace-id --body dVal --metadata '{"mKey":"mValue"}'`
				);
				expect(requests.count).toEqual(1);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should put a key with a binary value and metadata", async ({
				expect,
			}) => {
				const buf = Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAiSURBVHgB7coxEQAACMPAgH/PgAM6dGwu49fA/deIBXrgAj2cAhIFT4QxAAAAAElFTkSuQmCC",
					"base64"
				);
				writeFileSync("test.png", buf);
				const requests = mockKeyPutRequest(expect, "some-namespace-id", {
					key: "another-my-key",
					value: buf,
					metadata: {
						mKey: "mValue",
					},
				});
				await runWrangler(
					`kv keys put another-my-key --namespace-id some-namespace-id --file test.png --metadata '{"mKey":"mValue"}'`
				);
				expect(requests.count).toEqual(1);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// The generated command currently forwards multipart metadata as
			// text without applying Wrangler's JSON-object validation. These
			// should work in cf, but do not yet.
			it.todo("should error if --metadata is not valid JSON");
			it.todo("should error if --metadata is not a JSON object");

			it("should error if no key is provided", async ({ expect }) => {
				await expect(
					runWrangler("kv keys put")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Not enough non-option arguments: got 0, need at least 1]`
				);
			});

			// `--binding`, `--namespace-id` mutual exclusion is a wrangler
			// invariant: cf has only `--namespace-id` (required). Same
			// rationale for the matching `kv keys delete` / `kv keys list`
			// / `kv keys get` tests below.
			it.skip("should error if no binding nor namespace is provided", async () => {});
			it.skip("should error if both binding and namespace is provided", async () => {});

			it("should error if no value nor path is provided", async ({
				expect,
			}) => {
				await expect(
					runWrangler("kv keys put my-key --namespace-id some-namespace-id")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: --body is required for this command. Pass --body '<json>' or --body @path/to/file.json.]`
				);
			});

			// `--local` / `--remote` mutual exclusion is wrangler-only;
			// cf supports `--local` for KV but reserves `--remote` instead of
			// exposing a two-flag precedence matrix.
			it.skip("should error if both --local and --remote are provided", async () => {});

			// cf currently gives --file precedence over --body instead of
			// rejecting the ambiguous input.
			it.todo("should error if both value and path is provided");

			it.skip("should error if a given binding name is not in the configured kv namespaces", async () => {});
			it.skip("should error if a given binding has both preview and non-preview and --preview is not specified", async () => {});
		});

		describe("list", () => {
			// `kv keys list` is now generated — the kv overlay exposes a
			// `keys.list` leaf hitting GET .../namespaces/:id/keys.
			// Fixed: `test_bugs/kv-keys-list-not-generated.md`.
			it("should list the keys of a namespace specified by namespace-id", async ({
				expect,
			}) => {
				const keys: NamespaceKeyInfo[] = [
					{ name: "key-1" },
					{ name: "key-2", expiration: 123456789 },
					{ name: "key-3", expiration_ttl: 666 },
				];
				mockKeyListRequest(expect, "some-namespace-id", keys, 1000, "");
				await runWrangler("kv keys list --namespace-id some-namespace-id");
				expect(std.err).toMatchInlineSnapshot(`""`);
				// The generated SDK returns a Fern Page instance here. Only its
				// `data` items belong in CLI output, not `rawResponse`/`response`.
				expect(JSON.parse(std.out)).toEqual(keys);
			});

			// `--binding <name>` lookups are wrangler-only (cf doesn't
			// read worker config).
			it.skip("should list the keys of a namespace specified by binding", async () => {});
			it.skip("should list the keys of a preview namespace specified by binding", async () => {});
			it.skip("should list the keys of a namespace specified by binding, in a given environment", async () => {});
			it.skip("should list the keys of a preview namespace specified by binding, in a given environment", async () => {});

			// cf's `list` commands don't auto-paginate today
			// (`<product> list` returns just the first API page).
			// See `test_bugs/list-no-pagination.md`.
			it.todo("should make multiple requests for paginated results");

			it.skip("should error if a given binding name is not in the configured kv namespaces", async () => {});
		});

		describe("get", () => {
			it("should get a key in a given namespace specified by namespace-id", async ({
				expect,
			}) => {
				setMockFetchKVGetValue(
					expect,
					"some-account-id",
					"some-namespace-id",
					"my-key",
					"my-value"
				);

				await runWrangler(
					"kv keys get my-key --namespace-id some-namespace-id"
				);

				expect(proc.write).toEqual(Buffer.from("my-value"));
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should get a key and decode the value from the response as a utf8 string if the `--text` flag is passed", async ({
				expect,
			}) => {
				setMockFetchKVGetValue(
					expect,
					"some-account-id",
					"some-namespace-id",
					"my-key",
					"my-value"
				);
				// cf's `--text` path calls `process.stdout.write(string)`
				// rather than `console.log`, so we re-spy here to capture
				// the string write directly (the shared `mockProcess`
				// helper only surfaces Buffer writes).
				const writeSpy = vi
					.spyOn(process.stdout, "write")
					.mockImplementation(() => true);
				await runWrangler(
					"kv keys get my-key --text --namespace-id some-namespace-id"
				);
				const stringWrites = writeSpy.mock.calls
					.map((call) => call[0])
					.filter((arg): arg is string => typeof arg === "string");
				writeSpy.mockRestore();
				expect(proc.write).not.toEqual(Buffer.from("my-value"));
				// `withProgress` spinner also writes strings to stdout
				// (ANSI control codes); the payload write is the only one
				// that contains the decoded value verbatim.
				expect(stringWrites).toContain("my-value");
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should get a binary and decode as utf8 text, resulting in improper decoding", async ({
				expect,
			}) => {
				const buf = Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAiSURBVHgB7coxEQAACMPAgH/PgAM6dGwu49fA/deIBXrgAj2cAhIFT4QxAAAAAElFTkSuQmCC",
					"base64"
				);
				setMockFetchKVGetValue(
					expect,
					"some-account-id",
					"some-namespace-id",
					"my-key",
					buf
				);
				const writeSpy = vi
					.spyOn(process.stdout, "write")
					.mockImplementation(() => true);
				await runWrangler(
					"kv keys get my-key --text --namespace-id some-namespace-id"
				);
				const stringWrites = writeSpy.mock.calls
					.map((call) => call[0])
					.filter((arg): arg is string => typeof arg === "string");
				writeSpy.mockRestore();
				expect(proc.write).not.toEqual(buf);
				// utf-8 decoding of binary bytes is lossy; assert that the
				// PNG header survived as recognisable text instead of
				// pinning the exact replacement-character output.
				expect(stringWrites.join("")).toContain("PNG");
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should get a binary file by key in a given namespace specified by namespace-id", async ({
				expect,
			}) => {
				const buf = Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAiSURBVHgB7coxEQAACMPAgH/PgAM6dGwu49fA/deIBXrgAj2cAhIFT4QxAAAAAElFTkSuQmCC",
					"base64"
				);
				setMockFetchKVGetValue(
					expect,
					"some-account-id",
					"some-namespace-id",
					"my-key",
					buf
				);
				await runWrangler(
					"kv keys get my-key --namespace-id some-namespace-id"
				);
				expect(proc.write).toEqual(buf);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			// `--binding <name>` config lookup is wrangler-only.
			it.skip("should get a key in a given namespace specified by binding", async () => {});
			it.skip("should get a key in a given preview namespace specified by binding", async () => {});
			it.skip("should get a key for the specified environment in a given namespace", async () => {});

			// `kv keys get` streams raw bytes via `fetchRawBytes`, which
			// interpolates the key into a raw path (the raw-bytes output
			// path bypasses the typed resource method). The generator now
			// percent-encodes the interpolated path segments on that raw
			// branch, so a key like `/my-key` reaches the API as
			// `%2Fmy-key`. Same fix as the matching `update` encode test.
			// Fixed: test_bugs/generator-raw-path-no-url-encode.md
			it("should encode the key in the api request to get a value", async ({
				expect,
			}) => {
				setMockFetchKVGetValue(
					expect,
					"some-account-id",
					"some-namespace-id",
					"%2Fmy-key",
					"my-value"
				);

				await runWrangler(
					"kv keys get /my-key --namespace-id some-namespace-id"
				);

				expect(proc.write).toEqual(Buffer.from("my-value"));
				expect(std.err).toMatchInlineSnapshot(`""`);
			});

			it("should error if no key is provided", async ({ expect }) => {
				await expect(
					runWrangler("kv keys get")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Not enough non-option arguments: got 0, need at least 1]`
				);
			});

			it.skip("should error if no binding nor namespace is provided", async () => {});
			it.skip("should error if both binding and namespace is provided", async () => {});
			it.skip("should error if a given binding name is not in the configured kv namespaces", async () => {});

			// cf's account-discovery flow uses GET /accounts (not
			// /memberships) and produces different error messages /
			// shapes from wrangler. The whole non-interactive
			// multi-account-selection cohort below tests the wrangler
			// implementation surface and has no direct cf equivalent.
			describe.skip("non-interactive", () => {
				it("should error if there are multiple accounts available but not interactive on stdin", async () => {});
				it("should error if there are multiple accounts available but not interactive on stdout", async () => {});
				it("should recommend using a configuration if unable to fetch memberships", async () => {});
				it("should error if there are multiple accounts available but not interactive at all", async () => {});
			});
		});

		describe("delete", () => {
			function mockDeleteRequest(
				expect: ExpectStatic,
				expectedNamespaceId: string,
				expectedKey: string
			) {
				const requests = { count: 0 };
				msw.use(
					http.delete(
						"*/accounts/:accountId/storage/kv/namespaces/:namespaceId/values/:key",
						({ params }) => {
							requests.count++;
							expect(params.accountId).toEqual("some-account-id");
							expect(params.namespaceId).toEqual(expectedNamespaceId);
							expect(params.key).toEqual(expectedKey);
							return HttpResponse.json(createFetchResult(null), {
								status: 200,
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it("should delete a key in a namespace specified by id", async ({
				expect,
			}) => {
				const requests = mockDeleteRequest(
					expect,
					"some-namespace-id",
					"someKey"
				);
				mockConfirm({
					text: "This operation deletes the selected key-value pair from the Workers KV namespace. Continue?",
					result: true,
				});
				// `kv keys delete` no longer requires a `--body` workaround
				// for its empty-body DELETE schema.
				// Fixed: `test_bugs/delete-no-body-requires-body.md`.
				await runWrangler(
					`kv keys delete someKey --namespace-id some-namespace-id`
				);
				expect(requests.count).toEqual(1);
			});

			// `kv keys delete` (without `--body`) routes through the SDK's
			// `kv.keys.delete` resource method, which percent-encodes the
			// key path param (`encodeURIComponent`). cf no longer rejects
			// special-char keys client-side (validateResourceId was
			// dropped). Fixed: `test_bugs/sdk-no-url-encode-path-params.md`.
			it("should encode the key in the api request to delete a value", async ({
				expect,
			}) => {
				const requests = mockDeleteRequest(expect, "voyager", "/NCC-74656");
				await runWrangler(
					`kv keys delete /NCC-74656 --namespace-id voyager --force`
				);
				expect(requests.count).toEqual(1);
			});

			// `--binding <name>` config lookups are wrangler-only.
			it.skip("should delete a key in a namespace specified by binding name", async () => {});
			it.skip("should delete a key in a preview namespace specified by binding name", async () => {});
			it.skip("should error if a given binding name is not in the configured kv namespaces", async () => {});
			it.skip("should delete a key in a namespace specified by binding name in a given environment", async () => {});
			it.skip("should delete a key in a preview namespace specified by binding name in a given environment", async () => {});
		});
	});
});

function mockKeyListRequest(
	expect: ExpectStatic,
	expectedNamespaceId: string,
	expectedKeys: NamespaceKeyInfo[],
	keysPerRequest = 1000,
	blankCursorValue: "" | undefined | null
) {
	const requests = { count: 0 };
	// See https://api.cloudflare.com/#workers-kv-namespace-list-a-namespace-s-keys
	msw.use(
		http.get(
			"*/accounts/:accountId/storage/kv/namespaces/:namespaceId/keys",
			({ request, params }) => {
				const url = new URL(request.url);

				requests.count++;
				let result;
				let cursor;

				expect(params.accountId).toEqual("some-account-id");
				expect(params.namespaceId).toEqual(expectedNamespaceId);

				if (expectedKeys.length <= keysPerRequest) {
					result = expectedKeys;
				} else {
					const start = parseInt(url.searchParams.get("cursor") ?? "0") || 0;
					const end = start + keysPerRequest;
					cursor = end < expectedKeys.length ? end : blankCursorValue;
					result = expectedKeys.slice(start, end);
				}
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result,
					result_info: {
						cursor,
					},
				});
			}
		)
	);
	return requests;
}

function setMockFetchKVGetValue(
	expect: ExpectStatic,
	accountId: string,
	namespaceId: string,
	key: string,
	value: string | Buffer
) {
	msw.use(
		http.get(
			"*/accounts/:accountId/storage/kv/namespaces/:namespaceId/values/:key",
			({ request, params }) => {
				const url = new URL(request.url);

				expect(params.accountId).toEqual(accountId);
				expect(params.namespaceId).toEqual(namespaceId);
				// Getting the key from params decodes it so we need to grab the encoded key from the URL
				expect(url.toString().split("/").pop()).toBe(key);

				return new HttpResponse(value, { status: 200 });
			},
			{ once: true }
		)
	);
}
