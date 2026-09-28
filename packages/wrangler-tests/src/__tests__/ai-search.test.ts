import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// ── Shared test data ──────────────────────────────────────────────────────────

const MOCK_INSTANCE = {
	id: "my-instance",
	created_at: "2025-01-01T00:00:00Z",
	modified_at: "2025-01-02T00:00:00Z",
	source: "my-bucket",
	type: "r2",
	status: "active",
	ai_search_model: "@cf/meta/llama-3-8b",
	embedding_model: "@cf/bge-base-en-v1.5",
};

const MOCK_INSTANCE_2 = {
	id: "other-instance",
	created_at: "2025-02-01T00:00:00Z",
	modified_at: "2025-02-02T00:00:00Z",
	source: "https://example.com",
	type: "web-crawler",
	status: "active",
};

const MOCK_STATS = {
	queued: 0,
	running: 0,
	completed: 3464,
	skipped: 1744,
	outdated: 1,
	error: 2,
};

const MOCK_NAMESPACE = {
	name: "default",
	created_at: "2025-01-01T00:00:00Z",
	description: "Default namespace",
};

const MOCK_NAMESPACE_2 = {
	name: "blog",
	created_at: "2025-02-01T00:00:00Z",
	description: "Blog content",
};

const MOCK_JOB = {
	id: "job-001",
	source: "user",
	description: "Manual reindex",
	started_at: "2025-03-01T00:00:00Z",
	ended_at: "2025-03-01T00:05:00Z",
	end_reason: "completed",
};

const MOCK_JOB_2 = {
	id: "job-002",
	source: "schedule",
	started_at: "2025-03-02T00:00:00Z",
};

// ── Help / Namespace ──────────────────────────────────────────────────────────

// cf's ai-search help format differs entirely from wrangler's (cf prints
// "Usage: cf ai-search ..." with its own subcommand list). The "wrangler
// ai-search" / "wrangler ai-search list" assertions don't translate.
describe("ai-search help", () => {
	it.skip("should show help when no argument is passed", async () => {});
	it.skip("should show help when an invalid argument is passed", async () => {});
	it.skip("should show namespace subcommand help", async () => {});
	it.skip("should show jobs subcommand help", async () => {});
});

// ── Command tests ─────────────────────────────────────────────────────────────

describe("ai-search commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	const std = mockConsoleMethods();

	beforeEach(() => {
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	// ── list ────────────────────────────────────────────────────────────────────

	describe("list", () => {
		it("should list instances from the default namespace", async ({
			expect,
		}) => {
			mockListInstances([MOCK_INSTANCE, MOCK_INSTANCE_2]);
			await runWrangler("ai-search list --name default");
			expect(std.out).toContain(MOCK_INSTANCE.id);
			expect(std.out).toContain(MOCK_INSTANCE_2.id);
			expect(std.out).toContain(MOCK_INSTANCE.type);
			expect(std.out).toContain(MOCK_INSTANCE_2.type);
		});

		it.todo("should hit the default namespace when --namespace is omitted");

		it("should hit the provided namespace when --namespace is set", async ({
			expect,
		}) => {
			let capturedNamespace: string | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances",
					({ params }) => {
						capturedNamespace = params.namespace as string;
						return HttpResponse.json(createFetchResult([]));
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search list --name blog");
			expect(capturedNamespace).toBe("blog");
		});

		it.todo("should accept the -n short alias");

		// cf's list always emits JSON — there is no `--json` flag and no
		// alternative formatted output. The "default vs --json" distinction
		// is wrangler-specific.
		it.skip("should list instances as JSON", async () => {});
		it.skip("should not print beta status banner when --json is passed", async () => {});

		it.skip("should output empty JSON array when no instances exist with --json", async () => {});

		// Wrangler-only "no instances on this account" friendly warning;
		// cf just prints `[]` (JSON empty array).
		it.skip("should warn when no instances exist", async () => {});

		// Wrangler-only "page 99 out of range" friendly warning; cf has no
		// such hand-rolled pagination message.
		it.skip("should warn when page is out of range", async () => {});

		it("should pass pagination params", async ({ expect }) => {
			let capturedUrl: URL | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/ai-search/namespaces/default/instances",
					({ request }) => {
						capturedUrl = new URL(request.url);
						return HttpResponse.json(
							createFetchResult([], true, [], [], {
								page: 2,
								per_page: 5,
								count: 0,
								total_count: 0,
							})
						);
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search list --name default --page 2 --per-page 5");
			expect(capturedUrl?.searchParams.get("page")).toBe("2");
			expect(capturedUrl?.searchParams.get("per_page")).toBe("5");
		});
	});

	// ── create ──────────────────────────────────────────────────────────────────

	describe("create", () => {
		it("should create an R2 instance with all flags", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/default/instances",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_INSTANCE, true));
					},
					{ once: true }
				)
			);
			await runWrangler(
				"ai-search create default my-instance --type r2 --source my-bucket --embedding-model openai/text-embedding-3-small --ai-search-model openai/gpt-5 --chunk-size 512 --chunk-overlap 64 --max-num-results 10 --reranking --index-method-keyword --index-method-vector --cache --score-threshold 0.5"
			);
			expect(capturedBody).toMatchObject({
				id: "my-instance",
				source: "my-bucket",
				type: "r2",
				embedding_model: "openai/text-embedding-3-small",
				ai_search_model: "openai/gpt-5",
				chunk_size: 512,
				chunk_overlap: 64,
				max_num_results: 10,
				reranking: true,
				index_method: { keyword: true, vector: true },
				cache: true,
				score_threshold: 0.5,
			});
		});

		it("should create an instance in a custom namespace", async ({
			expect,
		}) => {
			let capturedNamespace: string | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances",
					({ params }) => {
						capturedNamespace = params.namespace as string;
						return HttpResponse.json(createFetchResult(MOCK_INSTANCE));
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search create blog my-instance --body {}");
			expect(capturedNamespace).toBe("blog");
		});

		it.skip("should create instance and print details", async () => {});
		it.skip("should create instance as JSON", async () => {});

		it("should send source_params with prefix and include/exclude items", async ({
			expect,
		}) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/default/instances",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_INSTANCE, true));
					},
					{ once: true }
				)
			);
			await runWrangler(
				'ai-search create default my-instance --type r2 --source my-bucket --index-method-keyword --index-method-vector --source-params-prefix docs/ --source-params-include-items "*.md" --source-params-exclude-items "*.tmp"'
			);
			expect(capturedBody).toMatchObject({
				source_params: {
					prefix: "docs/",
					include_items: ["*.md"],
					exclude_items: ["*.tmp"],
				},
			});
		});

		it.todo(
			"should default to the 'default' namespace in non-interactive mode when omitted"
		);
		it.skip("should interactively pick an existing namespace when --namespace is omitted", async () => {});
		it.skip("should offer the 'default' namespace in the picker even when the list endpoint omits it", async () => {});
		it.skip("should skip the interactive namespace picker when --json is passed", async () => {});
		it.skip("should interactively create a new namespace when selected", async () => {});

		it("should send source_params.r2_jurisdiction for an R2 source", async ({
			expect,
		}) => {
			const body = mockCaptureCreate();
			await runWrangler(
				"ai-search create default my-instance --type r2 --source my-bucket --source-params-r2-jurisdiction eu"
			);
			await expect(body).resolves.toMatchObject({
				source_params: { r2_jurisdiction: "eu" },
			});
		});

		it("should omit r2_jurisdiction when --source-jurisdiction is not provided", async ({
			expect,
		}) => {
			const body = mockCaptureCreate();
			await runWrangler(
				"ai-search create default my-instance --type r2 --source my-bucket"
			);
			await expect(body).resolves.not.toHaveProperty(
				"source_params.r2_jurisdiction"
			);
		});

		it("should forward an arbitrary --source-jurisdiction value (server-side validated)", async ({
			expect,
		}) => {
			const body = mockCaptureCreate();
			await runWrangler(
				"ai-search create default my-instance --type r2 --source my-bucket --source-params-r2-jurisdiction custom-jurisdiction"
			);
			await expect(body).resolves.toMatchObject({
				source_params: { r2_jurisdiction: "custom-jurisdiction" },
			});
		});
		it.todo(
			"should error when --source-jurisdiction is used with --type builtin"
		);
		it.todo(
			"should error when --source-jurisdiction is used with --type web-crawler"
		);
		it.skip("should list buckets in the chosen jurisdiction and forward r2_jurisdiction (interactive)", async () => {});
		it.skip("should create a new bucket in the chosen jurisdiction (interactive)", async () => {});

		// cf has no AI Search token concept on the create flow.
		it.skip("should error in non-interactive mode when no tokens exist", async () => {});
		it.skip("should abort when user declines to create a token", async () => {});
		it.skip("should proceed after user creates a token on retry", async () => {});
		// cf has no interactive r2/web-crawler wizard — a wrangler-specific
		// affordance (forge x-forge-wizard equivalent doesn't exist yet).
		it.skip("should interactively select r2 type and existing bucket", async () => {});
		it.skip("should interactively create a new r2 bucket when selected", async () => {});
		it.skip("should interactively select web-crawler type and zone", async () => {});
		it.skip("should prompt for URL when no zones exist in web-crawler interactive mode", async () => {});
		it("should forward --parse-type discover for a web-crawler instance", async ({
			expect,
		}) => {
			const body = mockCaptureCreate();
			await runWrangler(
				"ai-search create default my-instance --type web-crawler --source https://example.com --source-params-web-crawler-parse-type discover"
			);
			await expect(body).resolves.toMatchObject({
				source_params: { web_crawler: { parse_type: "discover" } },
			});
		});

		it("should forward --parse-type sitemap for a web-crawler instance", async ({
			expect,
		}) => {
			const body = mockCaptureCreate();
			await runWrangler(
				"ai-search create default my-instance --type web-crawler --source https://example.com --source-params-web-crawler-parse-type sitemap"
			);
			await expect(body).resolves.toMatchObject({
				source_params: { web_crawler: { parse_type: "sitemap" } },
			});
		});
		it.todo(
			"should omit web_crawler source params when --parse-type is not passed in non-interactive mode"
		);
		it.skip("should interactively select the discover parse type", async () => {});
		it.todo("should error when --parse-type is used with --type builtin");
		it.todo("should error when --parse-type is used with --type r2");
		it("should reject an invalid --parse-type value", async ({ expect }) => {
			await expect(
				runWrangler(
					"ai-search create default my-instance --source-params-web-crawler-parse-type invalid"
				)
			).rejects.toThrow("Invalid values");
		});

		it("should error when name is missing", async ({ expect }) => {
			setIsTTY(false);
			// cf requires namespace and id positionals rather than Wrangler's
			// instance-name positional plus an optional namespace flag.
			await expect(() => runWrangler("ai-search create")).rejects.toThrow(
				"Not enough non-option arguments"
			);
		});

		// Wrangler-only --type / --source required-flag enforcement; cf
		// requires a different (and larger) set of flags, so the negative
		// cases don't match up.
		it.skip("should error in non-interactive mode when --type is missing", async () => {});
		it.skip("should error in non-interactive mode when --source is missing for r2", async () => {});
		it.skip("should error in non-interactive mode when --source is missing for web-crawler", async () => {});
		it.todo(
			"should create a builtin instance and omit type/source from the request body"
		);
		it.todo("should error when --source is passed with --type builtin");
		it.todo(
			"should error when source_params flags are passed with --type builtin"
		);
		it.skip("should interactively select builtin and omit type from the request body", async () => {});

		it.todo("should send custom_metadata when --custom-metadata is provided");
		it.todo("should accept multiple --custom-metadata flags");
		it.todo("should reject --custom-metadata with an invalid data_type");
		it.todo("should reject --custom-metadata that is missing a separator");
		it.todo("should reject --custom-metadata with a reserved field name");
		it.skip("should interactively configure custom_metadata when the flag is omitted", async () => {});
		it.skip("should not send custom_metadata when the user declines the optional step", async () => {});
		it.skip("should skip the custom_metadata prompt in non-interactive mode", async () => {});
		it.skip("should skip the custom_metadata prompt when --json is passed", async () => {});
		it.skip("should print the custom_metadata fields in the success summary", async () => {});
		it.todo(
			"should reject --custom-metadata-schema with the legacy object form"
		);
		it.todo(
			"should load custom_metadata from --custom-metadata-schema (bare array form)"
		);
		it.todo("should reject --custom-metadata-schema with malformed JSON");
		it.todo("should reject --custom-metadata-schema with an unsupported shape");
		it.todo("should reject --custom-metadata-schema with an invalid data_type");
		it.todo(
			"should reject --custom-metadata-schema with a reserved field name"
		);
		it.todo(
			"should reject combining --custom-metadata and --custom-metadata-schema"
		);
		it.todo(
			"should skip the interactive prompt when --custom-metadata-schema is provided"
		);
	});

	// ── get ──────────────────────────────────────────────────────────────────────

	describe("get", () => {
		it("should get instance details", async ({ expect }) => {
			mockGetInstance(MOCK_INSTANCE);
			await runWrangler("ai-search get my-instance --name default");
			expect(std.out).toContain("my-instance");
			expect(std.out).toContain("r2");
			expect(std.out).toContain("active");
			expect(std.out).toContain("my-bucket");
		});

		// cf's `read` always emits JSON, so the "--json variant prints id/type/
		// source" assertion duplicates the default-output test above.
		it.skip("should get instance as JSON", async () => {});

		it("should error when name is missing", async ({ expect }) => {
			await expect(() => runWrangler("ai-search get")).rejects.toThrow(
				"Not enough non-option arguments"
			);
		});
		it.todo("should get instance from custom namespace");
	});

	// ── update ──────────────────────────────────────────────────────────────────

	describe("update", () => {
		// Fixed: `ai-search-update-required-fields`. A partial PUT via
		// per-field flags no longer trips the create-only required-field
		// guards (`--index-method-*` / `--metadata-search-for-agents-*`
		// are now `required: false`, and the deeper `source_params`
		// group-implies `.check()` only fires when a sibling
		// `--source-params-*` flag is set). The previous `--body`
		// workaround is no longer needed to escape over-strict guards.
		it("should update instance with flags", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.put(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances/:id",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_INSTANCE, true));
					},
					{ once: true }
				)
			);
			await runWrangler(
				"ai-search update my-instance --name default --chunk-size 256 --chunk-overlap 64 --max-num-results 10 --reranking --cache --score-threshold 0.5"
			);
			expect(capturedBody).toMatchObject({
				chunk_size: 256,
				chunk_overlap: 64,
				max_num_results: 10,
				reranking: true,
				cache: true,
				score_threshold: 0.5,
			});
		});

		// cf's `update` always emits JSON; the wrangler default-output vs
		// --json distinction has no cf equivalent.
		it.skip("should update instance as JSON", async () => {});
		it.todo("should update instance in a custom namespace");

		// Fixed: `ai-search-update-required-fields` (forge overlay marks
		// `--index-method-*` / `--metadata-search-for-agents-*` as
		// `required: false`) + `body-params-required-within-optional-parent`
		// (the generator's group-implies `.check()` only requires the
		// deeper `--source-params-web-crawler-store-options-storage-id`
		// leaf when another `--source-params-*` sibling is set). cf's
		// `update` therefore no longer enforces any create-only required
		// field, so there is no "no fields provided" error path — a
		// genuinely partial update via a single per-flag value succeeds
		// and sends only that field. (Adapted from wrangler's
		// "should error when no fields are provided", which asserted an
		// error cf no longer raises.)
		it.todo("should error when no fields are provided");

		it("should only send provided fields", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.put(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances/:id",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_INSTANCE, true));
					},
					{ once: true }
				)
			);
			await runWrangler(
				"ai-search update my-instance --name default --cache --score-threshold 0.75"
			);
			// Only the fields explicitly passed as flags should be sent;
			// unpassed flags (incl. create-only required fields) are omitted
			// entirely rather than defaulted onto the wire body.
			expect(capturedBody).toEqual({ cache: true, score_threshold: 0.75 });
		});
	});

	// ── delete ──────────────────────────────────────────────────────────────────

	describe("delete", () => {
		it("should delete with confirmation", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes the AI Search instance and all its indexed data. Continue?",
				result: true,
			});
			const requests = mockDeleteInstance();
			await runWrangler("ai-search delete my-instance --name default");
			expect(requests.count).toBe(1);
		});

		it("should cancel deletion when not confirmed", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes the AI Search instance and all its indexed data. Continue?",
				result: false,
			});
			const requests = mockDeleteInstance();
			await runWrangler("ai-search delete my-instance --name default");
			expect(requests.count).toBe(0);
		});

		it("should delete with --force flag", async ({ expect }) => {
			const requests = mockDeleteInstance();
			await runWrangler("ai-search delete my-instance --name default --force");
			expect(requests.count).toBe(1);
		});
		it.todo("should delete instance from custom namespace");
	});

	// ── stats ───────────────────────────────────────────────────────────────────

	describe("stats", () => {
		// Wrangler-only formatted table output ("Queued / Processing / Indexed
		// / Skipped / Outdated / Errors" labels). cf's stats command emits
		// the raw API response as JSON.
		it.skip("should display stats in table", async () => {});

		it("should display stats as JSON", async ({ expect }) => {
			mockGetStats(MOCK_STATS);
			await runWrangler("ai-search stats my-instance --name default");
			const parsed = JSON.parse(std.out);
			expect(parsed.queued).toBe(0);
			expect(parsed.running).toBe(0);
			expect(parsed.completed).toBe(3464);
			expect(parsed.skipped).toBe(1744);
			expect(parsed.outdated).toBe(1);
			expect(parsed.error).toBe(2);
		});
		it.todo("should route stats through the specified namespace");
	});

	// ── search ──────────────────────────────────────────────────────────────────

	describe("search", () => {
		// Wrangler's search posts `{ messages: [{role, content}], filters }`
		// and renders a custom table with score, key, truncated text, "No
		// results found" etc. cf's search posts `{ ai_search_options, query }`
		// against the same path and emits the raw API response as JSON. The
		// body shape, the table-format assertions, and the --filter flag all
		// have no cf equivalent.
		it.skip("should perform a search query", async () => {});
		it.skip("should output search results as JSON", async () => {});
		it.skip("should handle empty results", async () => {});
		it.skip("should truncate long text at 80 chars", async () => {});
		it.skip("should parse --filter flags", async () => {});
		it.skip("should warn on malformed filters", async () => {});
		it.skip("should handle chunk with missing item key", async () => {});

		it("should send messages in correct format", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances/:id/search",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(
							createFetchResult(
								{ chunks: [], search_query: "hello world" },
								true
							)
						);
					},
					{ once: true }
				)
			);
			await runWrangler(
				'ai-search search my-instance "hello world" --name default'
			);
			// cf sends `{ ai_search_options, query }` rather than wrangler's
			// `{ messages: [{ role, content }] }`. Same endpoint, different
			// payload shape.
			expect(capturedBody).toMatchObject({ query: "hello world" });
		});
		it.todo("should route search through the specified namespace");
	});

	describe("namespace", () => {
		it("should list namespaces", async ({ expect }) => {
			mockJson("get", "*/accounts/:accountId/ai-search/namespaces", [
				MOCK_NAMESPACE,
				MOCK_NAMESPACE_2,
			]);
			await runWrangler("ai-search namespace list");
			expect(JSON.parse(std.out)).toEqual([MOCK_NAMESPACE, MOCK_NAMESPACE_2]);
		});

		it.skip("should list namespaces as JSON", async () => {});
		it.skip("should warn when no namespaces exist", async () => {});

		it("should pass search and pagination params", async ({ expect }) => {
			let capturedUrl: URL | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/ai-search/namespaces",
					({ request }) => {
						capturedUrl = new URL(request.url);
						return HttpResponse.json(createFetchResult([]));
					},
					{ once: true }
				)
			);
			await runWrangler(
				"ai-search namespace list --page 3 --per-page 10 --search blog"
			);
			expect(capturedUrl?.searchParams.get("page")).toBe("3");
			expect(capturedUrl?.searchParams.get("per_page")).toBe("10");
			expect(capturedUrl?.searchParams.get("search")).toBe("blog");
		});

		it("should create a namespace", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_NAMESPACE_2));
					},
					{ once: true }
				)
			);
			await runWrangler(
				'ai-search namespace create blog --description "Blog content"'
			);
			expect(capturedBody).toMatchObject({
				name: "blog",
				description: "Blog content",
			});
		});

		it("should create a namespace without description", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_NAMESPACE_2));
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search namespace create blog");
			expect(capturedBody).not.toHaveProperty("description");
		});

		it.skip("should create a namespace as JSON", async () => {});

		it("should error when name is missing", async ({ expect }) => {
			await expect(runWrangler("ai-search namespace create")).rejects.toThrow(
				"Not enough non-option arguments"
			);
		});

		it("should get namespace details", async ({ expect }) => {
			mockJson(
				"get",
				"*/accounts/:accountId/ai-search/namespaces/blog",
				MOCK_NAMESPACE_2
			);
			await runWrangler("ai-search namespace get blog");
			expect(JSON.parse(std.out)).toEqual(MOCK_NAMESPACE_2);
		});

		it.skip("should get namespace as JSON", async () => {});

		it("should update a namespace description", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.put(
					"*/accounts/:accountId/ai-search/namespaces/blog",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_NAMESPACE_2));
					},
					{ once: true }
				)
			);
			await runWrangler(
				'ai-search namespace update blog --description "Updated"'
			);
			expect(capturedBody).toEqual({ description: "Updated" });
		});

		it.todo("should error when no fields are provided");

		it("should delete namespace with confirmation", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes the namespace. Continue?",
				result: true,
			});
			const requests = mockCountedDelete(
				"*/accounts/:accountId/ai-search/namespaces/blog"
			);
			await runWrangler("ai-search namespace delete blog");
			expect(requests.count).toBe(1);
		});

		it("should cancel namespace deletion when not confirmed", async ({
			expect,
		}) => {
			mockConfirm({
				text: "This operation permanently deletes the namespace. Continue?",
				result: false,
			});
			const requests = mockCountedDelete(
				"*/accounts/:accountId/ai-search/namespaces/blog"
			);
			await runWrangler("ai-search namespace delete blog");
			expect(requests.count).toBe(0);
		});

		it("should delete namespace with --force flag", async ({ expect }) => {
			const requests = mockCountedDelete(
				"*/accounts/:accountId/ai-search/namespaces/blog"
			);
			await runWrangler("ai-search namespace delete blog --force");
			expect(requests.count).toBe(1);
		});
	});

	describe("jobs", () => {
		it("should list jobs for an instance", async ({ expect }) => {
			mockJson(
				"get",
				"*/accounts/:accountId/ai-search/namespaces/default/instances/my-instance/jobs",
				[MOCK_JOB, MOCK_JOB_2]
			);
			await runWrangler("ai-search jobs list --name default --id my-instance");
			expect(JSON.parse(std.out)).toEqual([MOCK_JOB, MOCK_JOB_2]);
		});

		it.skip("should list jobs as JSON", async () => {});

		it("should route through the instance and namespace", async ({
			expect,
		}) => {
			let captured: Record<string, string | readonly string[] | undefined> = {};
			msw.use(
				http.get(
					"*/accounts/:accountId/ai-search/namespaces/:namespace/instances/:id/jobs",
					({ params }) => {
						captured = params;
						return HttpResponse.json(createFetchResult([]));
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search jobs list --name blog --id my-instance");
			expect(captured.namespace).toBe("blog");
			expect(captured.id).toBe("my-instance");
		});

		it.skip("should warn when no jobs exist", async () => {});

		it("should pass pagination params", async ({ expect }) => {
			let capturedUrl: URL | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/ai-search/namespaces/default/instances/my-instance/jobs",
					({ request }) => {
						capturedUrl = new URL(request.url);
						return HttpResponse.json(createFetchResult([]));
					},
					{ once: true }
				)
			);
			await runWrangler(
				"ai-search jobs list --name default --id my-instance --page 2 --per-page 5"
			);
			expect(capturedUrl?.searchParams.get("page")).toBe("2");
			expect(capturedUrl?.searchParams.get("per_page")).toBe("5");
		});

		it("should create a job with a description", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/default/instances/my-instance/jobs",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_JOB));
					},
					{ once: true }
				)
			);
			await runWrangler(
				'ai-search jobs create my-instance --name default --description "Manual reindex"'
			);
			expect(capturedBody).toEqual({ description: "Manual reindex" });
		});

		it("should create a job without a description", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					"*/accounts/:accountId/ai-search/namespaces/default/instances/my-instance/jobs",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(MOCK_JOB));
					},
					{ once: true }
				)
			);
			await runWrangler("ai-search jobs create my-instance --name default");
			expect(capturedBody).toEqual({});
		});

		it.skip("should create a job as JSON", async () => {});

		it("should get job details", async ({ expect }) => {
			mockJson(
				"get",
				"*/accounts/:accountId/ai-search/namespaces/default/instances/my-instance/jobs/job-001",
				MOCK_JOB
			);
			await runWrangler(
				"ai-search jobs get job-001 --name default --id my-instance"
			);
			expect(JSON.parse(std.out)).toEqual(MOCK_JOB);
		});

		it.skip("should get a job as JSON", async () => {});
		it.todo("should route through the job id in the URL");

		it("should error when job id is missing", async ({ expect }) => {
			await expect(
				runWrangler("ai-search jobs get --name default --id my-instance")
			).rejects.toThrow("Not enough non-option arguments");
		});

		it.todo("should cancel with confirmation");
		it.todo("should send action=cancel in the PATCH body");
		it.todo("should abort when not confirmed");
		it.todo("should cancel with --force flag");
		it.todo("should list job logs");
		it.skip("should list job logs as JSON", async () => {});
		it.skip("should warn when no logs exist", async () => {});
	});
});

// ── MSW Mock Handlers ─────────────────────────────────────────────────────────

function mockListInstances(instances: unknown[]) {
	msw.use(
		http.get(
			"*/accounts/:accountId/ai-search/namespaces/default/instances",
			() => {
				return HttpResponse.json(
					createFetchResult(instances, true, [], [], {
						page: 1,
						per_page: 20,
						count: instances.length,
						total_count: instances.length,
					})
				);
			},
			{ once: true }
		)
	);
}

function mockGetInstance(instance: unknown) {
	msw.use(
		http.get(
			"*/accounts/:accountId/ai-search/namespaces/default/instances/:id",
			() => {
				return HttpResponse.json(createFetchResult(instance, true));
			},
			{ once: true }
		)
	);
}

function mockDeleteInstance() {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			"*/accounts/:accountId/ai-search/namespaces/default/instances/:id",
			() => {
				requests.count++;
				return HttpResponse.json(createFetchResult(null, true));
			},
			{ once: true }
		)
	);
	return requests;
}

function mockGetStats(stats: unknown) {
	msw.use(
		http.get(
			"*/accounts/:accountId/ai-search/namespaces/default/instances/:id/stats",
			() => {
				return HttpResponse.json(createFetchResult(stats, true));
			},
			{ once: true }
		)
	);
}

function mockCaptureCreate(): Promise<Record<string, unknown>> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/ai-search/namespaces/default/instances",
				async ({ request }) => {
					const body = (await request.json()) as Record<string, unknown>;
					resolve(body);
					return HttpResponse.json(createFetchResult(MOCK_INSTANCE, true));
				},
				{ once: true }
			)
		);
	});
}

function mockJson(
	method: "get" | "post" | "put" | "patch" | "delete",
	path: string,
	result: unknown
) {
	msw.use(
		http[method](
			path,
			() => HttpResponse.json(createFetchResult(result, true)),
			{ once: true }
		)
	);
}

function mockCountedDelete(path: string) {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			path,
			() => {
				requests.count++;
				return HttpResponse.json(createFetchResult(null, true));
			},
			{ once: true }
		)
	);
	return requests;
}
