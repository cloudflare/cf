import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { KVNamespaceInfo } from "../../kv/helpers";
import type { ExpectStatic } from "vite-plus/test";

describe("kv", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	const std = mockConsoleMethods();

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	describe("namespace", () => {
		describe("create", () => {
			// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
			function mockCreateRequest(expect: ExpectStatic, expectedTitle: string) {
				msw.use(
					http.post(
						"*/accounts/:accountId/storage/kv/namespaces",
						async ({ request, params }) => {
							expect(params.accountId).toEqual("some-account-id");
							const title = ((await request.json()) as Record<string, string>)
								.title;
							expect(title).toEqual(expectedTitle);
							return HttpResponse.json(
								createFetchResult({ id: "some-namespace-id" }),
								{ status: 200 }
							);
						},
						{ once: true }
					)
				);
			}

			it("should error if no namespace is given", async ({ expect }) => {
				setIsTTY(false);
				await expect(
					runWrangler("kv namespaces create")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: --title is required. Pass --title <value> or run interactively.]`
				);
				expect(std.out).toMatchInlineSnapshot(`""`);
				expect(std.err).toMatchInlineSnapshot(`
					"
					┌ Error
					│ --title is required. Pass --title <value> or run interactively.
					└"
				`);
			});

			it("should error if the namespace to create contains spaces", async ({
				expect,
			}) => {
				await expect(
					runWrangler("kv namespaces create --title abc def ghi")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Unknown commands: def, ghi]`
				);
				expect(std.out).toMatchInlineSnapshot(`""`);
				expect(std.err).toContain("Unknown commands: def, ghi");
			});

			it("should error if the namespace already exists", async ({ expect }) => {
				msw.use(
					http.post(
						"*/accounts/:accountId/storage/kv/namespaces",
						() => {
							return HttpResponse.json(
								{
									result: null,
									success: false,
									errors: [
										{
											code: 10014,
											message:
												"create namespace: 'A namespace with this account ID and title already exists'",
										},
									],
									messages: [],
								},
								{ status: 400 }
							);
						},
						{ once: true }
					)
				);

				await expect(
					runWrangler("kv namespaces create --title DuplicateNamespace")
				).rejects.toThrow("Status code: 400");
				expect(std.out).toMatchInlineSnapshot(`""`);
				expect(std.err).toMatchInlineSnapshot(`
					"
					┌ APIError
					│ [10014] create namespace: 'A namespace with this account ID and title already exists'
					│ 400 Bad Request · HTTP /accounts/some-account-id/storage/kv/namespaces
					└"
				`);
			});

			it("should create a namespace in a jurisdiction", async ({ expect }) => {
				msw.use(
					http.post(
						"*/accounts/:accountId/storage/kv/namespaces",
						async ({ request, params }) => {
							expect(params.accountId).toEqual("some-account-id");
							expect(await request.json()).toEqual({
								jurisdiction: "eu",
								title: "UnitTestNamespace",
							});
							return HttpResponse.json(
								createFetchResult({ id: "some-namespace-id" }),
								{ status: 200 }
							);
						},
						{ once: true }
					)
				);

				await runWrangler(
					"kv namespaces create --title UnitTestNamespace --jurisdiction eu"
				);
				expect(JSON.parse(std.out)).toEqual({ id: "some-namespace-id" });
			});

			// Skipped: every test in this describe.each cohort exercises
			// wrangler's config-update-on-create flow (--binding, --use-remote,
			// --env, prompts to add the new resource to wrangler.json/toml,
			// reads the updated config back). cf doesn't read or write worker
			// config — see AGENTS.md "cf does NOT read project worker config".
			describe.skip.each(["wrangler.json", "wrangler.toml"])(
				"%s",
				(_configPath) => {
					it("should create a namespace", async () => {});
					it("should create a namespace with custom binding name", async () => {});
					it("should create a preview namespace if configured to do so", async () => {});
					it("should create a namespace using configured worker name", async () => {});
					it("should create a namespace in an environment if configured to do so", async () => {});
				}
			);
		});

		describe("list", () => {
			function mockListRequest(
				expect: ExpectStatic,
				namespaces: KVNamespaceInfo[]
			) {
				const requests = { count: 0 };
				msw.use(
					http.get(
						"*/accounts/:accountId/storage/kv/namespaces",
						async ({ request, params }) => {
							const url = new URL(request.url);

							requests.count++;
							expect(params.accountId).toEqual("some-account-id");

							const pageSize = Number(
								url.searchParams.get("per_page") ?? "100"
							);
							const page = Number(url.searchParams.get("page") ?? 1);
							return HttpResponse.json(
								createFetchResult(
									namespaces.slice((page - 1) * pageSize, page * pageSize)
								)
							);
						}
					)
				);
				return requests;
			}

			it("should list namespaces", async ({ expect }) => {
				const kvNamespaces: KVNamespaceInfo[] = [
					{ title: "title-1", id: "id-1" },
					{ title: "title-2", id: "id-2" },
				];
				mockListRequest(expect, kvNamespaces);
				await runWrangler("kv namespaces list");

				expect(std.err).toMatchInlineSnapshot(`""`);
				expect(JSON.parse(std.out)).toEqual(kvNamespaces);
			});

			// cf doesn't auto-paginate `list` commands today
			// `test_bugs/list-no-pagination.md`
			it.todo("should make multiple requests for paginated results");
		});

		describe("delete", () => {
			function mockDeleteRequest(
				expect: ExpectStatic,
				expectedNamespaceId: string
			) {
				const requests = { count: 0 };
				msw.use(
					http.delete(
						"*/accounts/:accountId/storage/kv/namespaces/:namespaceId",
						async ({ params }) => {
							requests.count++;
							expect(params.accountId).toEqual("some-account-id");
							expect(params.namespaceId).toEqual(expectedNamespaceId);
							return HttpResponse.json(createFetchResult(null), {
								status: 200,
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it("should delete a namespace specified by id", async ({ expect }) => {
				const requests = mockDeleteRequest(expect, "some-namespace-id");

				mockConfirm({
					text: "This operation deletes the selected Workers KV namespace and all of its key-value pairs. Continue?",
					result: true,
				});
				await runWrangler("kv namespaces delete some-namespace-id");

				expect(requests.count).toEqual(1);
			});
			it("should not ask for confirmation in non-interactive contexts", async ({
				expect,
			}) => {
				const requests = mockDeleteRequest(expect, "some-namespace-id");

				setIsTTY(false);
				await runWrangler("kv namespaces delete some-namespace-id --force");

				expect(requests.count).toEqual(1);
			});

			// `--binding <name>` lets wrangler resolve a namespace id from
			// the local wrangler.toml. cf doesn't read worker config, so
			// the entire --binding flow has no cf equivalent.
			it.skip("should delete a namespace specified by binding name", async () => {});
			it.skip("should delete a preview namespace specified by binding name", async () => {});
			it.skip("should error if a given binding name is not in the configured kv namespaces", async () => {});
			it.skip("should delete a namespace specified by binding name in a given environment", async () => {});
			it.skip("should delete a preview namespace specified by binding name in a given environment", async () => {});

			// cf's `kv namespaces delete` takes only a positional <id>.
			// wrangler resolves a name→id via /storage/kv/namespaces (list)
			// before deleting; cf doesn't, so this name-resolution path —
			// and its negative cases (name not found, both name and id, both
			// name and binding) — has no cf equivalent.
			it.skip("should delete a namespace specified by name", async () => {});
			it.skip("should error if namespace name is not found", async () => {});
			it.skip("should error if both namespace name and --namespace-id are provided", async () => {});
			it.skip("should error if both namespace name and --binding are provided", async () => {});
			it.skip("should delete namespace by name with --skip-confirmation flag", async () => {});

			it("should error if no namespace identifier is provided", async ({
				expect,
			}) => {
				await expect(
					runWrangler("kv namespaces delete")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Not enough non-option arguments: got 0, need at least 1]`
				);
			});
		});

		describe("rename", () => {
			function mockUpdateRequest(
				expect: ExpectStatic,
				expectedNamespaceId: string,
				expectedTitle: string
			) {
				const requests = { count: 0 };
				msw.use(
					http.put(
						"*/accounts/:accountId/storage/kv/namespaces/:namespaceId",
						async ({ request, params }) => {
							requests.count++;
							expect(params.accountId).toEqual("some-account-id");
							expect(params.namespaceId).toEqual(expectedNamespaceId);
							const body = (await request.json()) as Record<string, string>;
							expect(body.title).toEqual(expectedTitle);
							return HttpResponse.json(
								createFetchResult({
									id: expectedNamespaceId,
									title: expectedTitle,
								}),
								{ status: 200 }
							);
						},
						{ once: true }
					)
				);
				return requests;
			}

			it("should display help for rename command", async ({ expect }) => {
				await expect(
					runWrangler("kv namespaces update --help")
				).resolves.toBeUndefined();

				const help = std.out.replace(
					/^=== STOP: AGENT COMMAND DISCOVERY ===[\s\S]*?=== END AGENT COMMAND DISCOVERY ===\n/,
					""
				);
				expect(help).toMatchInlineSnapshot(`
					"cf kv namespaces update <namespace-id>

					Changes the title of the specified Workers KV namespace and returns the updated
					namespace. The namespace ID and stored key-value pairs are unchanged.

					Positionals
					  namespace-id  ID of the Workers KV namespace.              [string] [required]

					Global flags
					  -q, --quiet       Suppress non-essential output     [boolean] [default: false]
					  -z, --zone        Zone ID or domain name (overrides CLOUDFLARE_ZONE_ID)
					                                                                        [string]
					      --profile     Use a specific auth profile                         [string]
					  -m, --mode        Mode used to evaluate project configuration         [string]
					      --local       Use local resource simulations    [boolean] [default: false]
					      --persist-to  Directory holding local persisted state (default:
					                    ~/.config/cloudflare/state)                         [string]
					  -h, --help        Show help                                          [boolean]
					  -v, --version     Show version number                                [boolean]

					Options
					      --title    Human-readable string name for a Workers KV namespace. [string]
					      --dry-run  Validate and show what would happen without executing
					                                                      [boolean] [default: false]
					      --body     Raw JSON request body (bypasses individual flags)      [string]

					To inspect the exact API request, run cf schema kv namespaces update"
				`);
			});

			// Note: this test and "should error if new-name is not provided"
			// below both hit the same yargs positional-arg validation before
			// the --title required-flag check is reached, so they yield
			// identical errors.
			it("should error if neither name nor namespace-id is provided", async ({
				expect,
			}) => {
				await expect(
					runWrangler("kv namespaces update --title new-name")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Not enough non-option arguments: got 0, need at least 1]`
				);
			});

			it("should error if new-name is not provided", async ({ expect }) => {
				setIsTTY(false);
				await expect(
					runWrangler("kv namespaces update some-namespace-id")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: --title is required. Pass --title <value> or run interactively.]`
				);
			});

			it("should rename namespace by ID", async ({ expect }) => {
				const requests = mockUpdateRequest(
					expect,
					"some-namespace-id",
					"new-namespace-name"
				);
				await runWrangler(
					"kv namespaces update some-namespace-id --title new-namespace-name"
				);
				expect(requests.count).toEqual(1);
				expect(std.out).toMatchInlineSnapshot(`
					"{
					  "id": "some-namespace-id",
					  "title": "new-namespace-name"
					}"
				`);
			});

			// cf's `kv namespaces update` takes an explicit positional id;
			// it doesn't list-then-update to resolve a name. The
			// name-resolution path has no cf equivalent.
			it.skip("should rename namespace by old name", async () => {});

			// Same wrangler-only name-resolution path as
			// "should rename namespace by old name" above: wrangler GET-listed
			// to look up the id by name and could surface a clean
			// "no namespace found with name X" error. cf goes straight to
			// PUT <id> with the positional, so this test would only ever
			// observe whatever the PUT endpoint replies — not a name-not-
			// found error.
			it.skip("should error if namespace with old name is not found", async () => {});

			it("should error if namespace ID does not exist", async ({ expect }) => {
				// Mock a 404 response for the namespace ID
				msw.use(
					http.put(
						"*/accounts/:accountId/storage/kv/namespaces/:namespaceId",
						({ params }) => {
							expect(params.accountId).toEqual("some-account-id");
							expect(params.namespaceId).toEqual("nonexistent-id");
							return HttpResponse.json(
								createFetchResult(null, false, [
									{ code: 10009, message: "Unknown namespace." },
								]),
								{ status: 404 }
							);
						},
						{ once: true }
					)
				);

				await expect(
					runWrangler("kv namespaces update nonexistent-id --title new-name")
				).rejects.toThrow("Status code: 404");
			});
		});
	});
});

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
