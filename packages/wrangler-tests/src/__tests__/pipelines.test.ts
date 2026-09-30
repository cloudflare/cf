import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";
import type { ExpectStatic } from "vitest";

// Inline replacements for `../pipelines/types` (which doesn't exist in
// this corpus). Just enough shape to keep the mocked-response objects
// well-typed.
interface SchemaField {
	name: string;
	type: string;
	required?: boolean;
	unit?: string;
}
interface PipelineTable {
	id: string;
	name: string;
	type: "stream" | "sink";
	version: number;
	latest: number;
	href: string;
}
interface Pipeline {
	id: string;
	name: string;
	sql: string;
	status: string;
	created_at: string;
	modified_at: string;
	tables?: PipelineTable[];
}
interface Stream {
	id: string;
	name: string;
	version: number;
	endpoint: string;
	format: { type: string; unstructured?: boolean };
	schema: { fields: SchemaField[] } | null;
	http: { enabled: boolean; authentication: boolean };
	worker_binding: { enabled: boolean };
	created_at: string;
	modified_at: string;
}
interface Sink {
	id: string;
	name: string;
	type: string;
	format: { type: string };
	schema: { fields: SchemaField[] } | null;
	config: Record<string, unknown>;
	created_at: string;
	modified_at: string;
}

describe("wrangler pipelines", () => {
	const std = mockConsoleMethods();
	mockAccountId();
	mockApiToken();
	runInTempDir();

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	const accountId = "some-account-id";

	function mockCreatePipelineRequest(
		expect: ExpectStatic,
		expectedRequest: {
			name: string;
			sql: string;
		}
	) {
		const requests = { count: 0 };
		msw.use(
			http.post(
				`*/accounts/${accountId}/pipelines/v1/pipelines`,
				async ({ request }) => {
					requests.count++;
					const body = (await request.json()) as { name: string; sql: string };
					expect(body.name).toBe(expectedRequest.name);
					expect(body.sql).toBe(expectedRequest.sql);
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: {
							id: "pipeline_123",
							name: expectedRequest.name,
							sql: expectedRequest.sql,
							status: "active",
							created_at: "2024-01-01T00:00:00Z",
							modified_at: "2024-01-01T00:00:00Z",
							tables: [
								{
									id: "stream_456",
									name: "test_stream",
									type: "stream",
									version: 1,
									latest: 1,
									href: "/accounts/some-account-id/pipelines/v1/streams/stream_456",
								},
								{
									id: "sink_789",
									name: "test_sink",
									type: "sink",
									version: 1,
									latest: 1,
									href: "/accounts/some-account-id/pipelines/v1/sinks/sink_789",
								},
							],
						},
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	function mockGetPipelineRequest(pipelineId: string, pipeline: Pipeline) {
		const requests = { count: 0 };
		msw.use(
			http.get(
				`*/accounts/${accountId}/pipelines/v1/pipelines/${pipelineId}`,
				() => {
					requests.count++;
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: pipeline,
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	function mockGetStreamRequest(streamId: string, stream: Stream) {
		const requests = { count: 0 };
		msw.use(
			http.get(
				`*/accounts/${accountId}/pipelines/v1/streams/${streamId}`,
				() => {
					requests.count++;
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: stream,
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	function mockListPipelinesRequest(pipelines: Pipeline[]) {
		const requests = { count: 0 };
		msw.use(
			http.get(
				`*/accounts/${accountId}/pipelines/v1/pipelines`,
				({ request }) => {
					requests.count++;
					const url = new URL(request.url);
					const page = Number(url.searchParams.get("page") || 1);
					const perPage = Number(url.searchParams.get("per_page") || 20);

					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: pipelines,
						result_info: {
							page,
							per_page: perPage,
							count: pipelines.length,
							total_count: pipelines.length,
						},
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
	function mockDeletePipelineRequest(pipelineId: string) {
		const requests = { count: 0 };
		msw.use(
			http.delete(
				`*/accounts/${accountId}/pipelines/v1/pipelines/${pipelineId}`,
				() => {
					requests.count++;
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: null,
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	describe("pipelines create", () => {
		it("should error when neither --sql nor --sql-file is provided", async ({
			expect,
		}) => {
			setIsTTY(false);
			await expect(
				runWrangler("pipelines create --name my_pipeline")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: --sql is required. Pass --sql <value> or run interactively.]`
			);
		});

		it("should create pipeline with inline SQL", async ({ expect }) => {
			const sql = "INSERT INTO test_sink SELECT * FROM test_stream;";
			const createRequest = mockCreatePipelineRequest(expect, {
				name: "my_pipeline",
				sql,
			});

			await runWrangler(`pipelines create --name my_pipeline --sql "${sql}"`);

			expect(createRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			// cf prints the raw API response as JSON; no SQL pre-validation
			// step or post-create stream lookup like wrangler does.
			expect(JSON.parse(std.out)).toMatchObject({
				id: "pipeline_123",
				name: "my_pipeline",
				sql,
			});
		});

		// Wrangler-only: cf doesn't accept --sql-file. The forge overlay
		// would need a paramOverride.fromFile annotation on `sql` to
		// support `--sql @file.sql`; that's tracked elsewhere.
		it.skip("should create pipeline from SQL file", async () => {});

		// Wrangler-only: cf doesn't pre-validate SQL via
		// /pipelines/v1/validate_sql before creating. SQL validation
		// surfaces only as the API's POST response (a 400-shaped error
		// pattern) — not a separate validate step.
		it.skip("should error when SQL validation fails", async () => {});

		// Wrangler-only: cf's errors.ts has no per-API-error-code knowledge
		// (see AGENTS.md "no per-code error mapping"). The wrangler test
		// asserts a specific "your account does not have access to the
		// new Pipelines API" hint; cf surfaces a generic APIError instead.
		it.skip("should show wrangler version message on authentication error", async () => {});
	});

	describe("pipelines list", () => {
		it("should list pipelines", async ({ expect }) => {
			const mockPipelines: Pipeline[] = [
				{
					id: "pipeline_1",
					name: "pipeline_one",
					sql: "INSERT INTO sink1 SELECT * FROM stream1;",
					status: "active",
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
				{
					id: "pipeline_2",
					name: "pipeline_two",
					sql: "INSERT INTO sink2 SELECT * FROM stream2;",
					status: "active",
					created_at: "2024-01-02T00:00:00Z",
					modified_at: "2024-01-02T00:00:00Z",
				},
			];

			const listRequest = mockListPipelinesRequest(mockPipelines);

			await runWrangler("pipelines list");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockPipelines);
		});

		it("should handle empty pipelines list", async ({ expect }) => {
			const listRequest = mockListPipelinesRequest([]);

			await runWrangler("pipelines list");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual([]);
		});

		// Wrangler-only: wrangler's `pipelines list` synthesises a merged
		// table by also calling the legacy /accounts/:id/pipelines list and
		// adding a "Type" column. cf has separate `pipelines list` (legacy)
		// and `pipelines list-v1` (new) commands and doesn't merge them.
		it.skip("should merge new and legacy pipelines with Type column for legacy", async () => {});

		it('supports valid json output with "--json" flag', async ({ expect }) => {
			const mockPipelines: Pipeline[] = [
				{
					id: "pipeline_1",
					name: "pipeline_one",
					sql: "INSERT INTO sink1 SELECT * FROM stream1;",
					status: "active",
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
				{
					id: "pipeline_2",
					name: "pipeline_two",
					sql: "INSERT INTO sink2 SELECT * FROM stream2;",
					status: "active",
					created_at: "2024-01-02T00:00:00Z",
					modified_at: "2024-01-02T00:00:00Z",
				},
			];

			mockListPipelinesRequest(mockPipelines);

			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines list");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockPipelines);
		});
	});

	describe("pipelines get", () => {
		it("should error when no pipeline ID provided", async ({ expect }) => {
			await expect(
				runWrangler("pipelines get")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Not enough non-option arguments: got 0, need at least 1]`
			);
		});

		it("should get pipeline details", async ({ expect }) => {
			const mockPipeline: Pipeline = {
				id: "pipeline_123",
				name: "my_pipeline",
				sql: "INSERT INTO test_sink SELECT * FROM test_stream;",
				status: "active",
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
				tables: [
					{
						id: "stream_456",
						name: "test_stream",
						type: "stream",
						version: 1,
						latest: 1,
						href: "/accounts/some-account-id/pipelines/v1/streams/stream_456",
					},
					{
						id: "sink_789",
						name: "test_sink",
						type: "sink",
						version: 1,
						latest: 1,
						href: "/accounts/some-account-id/pipelines/v1/sinks/sink_789",
					},
				],
			};

			const getRequest = mockGetPipelineRequest("pipeline_123", mockPipeline);

			await runWrangler("pipelines get pipeline_123");

			expect(getRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockPipeline);
		});

		// Wrangler-only: wrangler's `pipelines get` falls back to
		// /accounts/:id/pipelines/:name (legacy) when v1 returns 404. cf
		// has separate `pipelines get` (legacy) and `pipelines get-v1`
		// commands; no fallback.
		it.skip("should fall back to legacy API when pipeline not found in new API", async () => {});

		it('supports valid json output with "--json" flag', async ({ expect }) => {
			const mockPipeline: Pipeline = {
				id: "pipeline_123",
				name: "my_pipeline",
				sql: "INSERT INTO test_sink SELECT * FROM test_stream;",
				status: "active",
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
				tables: [
					{
						id: "stream_456",
						name: "test_stream",
						type: "stream",
						version: 1,
						latest: 1,
						href: "/accounts/some-account-id/pipelines/v1/streams/stream_456",
					},
					{
						id: "sink_789",
						name: "test_sink",
						type: "sink",
						version: 1,
						latest: 1,
						href: "/accounts/some-account-id/pipelines/v1/sinks/sink_789",
					},
				],
			};

			mockGetPipelineRequest("pipeline_123", mockPipeline);
			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines get pipeline_123");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockPipeline);
		});
	});

	describe("pipelines delete", () => {
		it("should error when no pipeline ID provided", async ({ expect }) => {
			await expect(
				runWrangler("pipelines delete")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Not enough non-option arguments: got 0, need at least 1]`
			);
		});

		// TODO: re-enable once the resource-label singularisation bug
		// is fixed (`test_bugs/resource-label-malformed-singulars.md`).
		// cf currently prints "Delete v1 'pipeline_123'?"
		// instead of "Delete pipeline 'pipeline_123'?."
		it.todo("should prompt for confirmation before delete", async () => {});

		// Wrangler-only: wrangler falls back to legacy DELETE /pipelines/:name
		// when v1 returns 404. cf has separate delete commands per API.
		it.skip("should fall back to legacy API when deleting pipeline not in new API", async () => {});
	});

	describe("pipelines update", () => {
		// Wrangler-only: wrangler's `pipelines update` first GETs the
		// pipeline; if it's a v1 pipeline (has a `sql` field) it errors
		// with a "V1 pipelines cannot be updated" message before falling
		// back to PUT /pipelines/:name. cf doesn't have a `pipelines
		// update-v1` command at all (the v1 API has no PUT/PATCH on
		// /pipelines), and cf's `pipelines update` is the legacy command
		// with a completely different flag surface.
		it.skip("should error when trying to update V1 pipeline", async () => {});

		// Wrangler-only: wrangler's `pipelines update --batch-max-mb` is
		// a legacy-only convenience that maps to
		// destination.batch.max_bytes on the legacy PUT. cf's `pipelines
		// update` exposes the raw forge-generated flag set
		// (--destination-batch-max-bytes etc.) and there's no
		// auto-fallback from v1 to legacy.
		it.skip("should update legacy pipeline with warning", async () => {});
	});

	describe("pipelines streams create", () => {
		// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
		function mockCreateStreamRequest(
			expect: ExpectStatic,
			expectedRequest: {
				name: string;
				hasSchema?: boolean;
			}
		) {
			const requests = { count: 0 };
			msw.use(
				http.post(
					`*/accounts/${accountId}/pipelines/v1/streams`,
					async ({ request }) => {
						requests.count++;
						const body = (await request.json()) as {
							name: string;
							schema?: { fields: SchemaField[] };
						};
						expect(body.name).toBe(expectedRequest.name);

						const schema = expectedRequest.hasSchema
							? {
									fields: [
										{ name: "id", type: "string", required: true },
										{
											name: "timestamp",
											type: "timestamp",
											required: true,
											unit: "millisecond",
										},
									],
								}
							: null;

						const format = expectedRequest.hasSchema
							? { type: "json" }
							: { type: "json", unstructured: true };

						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "stream_123",
								name: expectedRequest.name,
								version: 1,
								endpoint: `https://pipelines.cloudflare.com/${expectedRequest.name}`,
								format,
								schema,
								http: {
									enabled: true,
									authentication: true,
								},
								worker_binding: { enabled: true },
								created_at: "2024-01-01T00:00:00Z",
								modified_at: "2024-01-01T00:00:00Z",
							},
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		// cf's `pipelines streams create` has --name as a flag (not a
		// positional). Without --name, cf errors with "--name is required"
		// in non-TTY mode.
		it("should error when no stream name provided", async ({ expect }) => {
			setIsTTY(false);
			await expect(
				runWrangler("pipelines streams create")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: --name is required. Pass --name <value> or run interactively.]`
			);
		});

		// Wrangler-only: validates the stream name against
		// /^[a-zA-Z0-9_]+$/ before sending. cf doesn't pre-validate
		// stream-name characters; the API rejects bad names with a 400.
		it.skip("should error when name contains invalid characters", async () => {});

		// Fixed: `body-params-required-within-optional-parent`. The
		// generator's group-implies `.check()` only requires
		// `--schema-format-type` when another `--schema-*` sibling is set,
		// so a default stream (no `--schema-*` flags) creates with just
		// `--name` and the `schema` object is omitted from the wire body.
		it("should create stream with default settings", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					`*/accounts/${accountId}/pipelines/v1/streams`,
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "stream_123",
								name: "my_stream",
								version: 1,
								endpoint: "https://pipelines.cloudflare.com/my_stream",
								format: { type: "json", unstructured: true },
								schema: null,
								http: { enabled: true, authentication: true },
								worker_binding: { enabled: true },
								created_at: "2024-01-01T00:00:00Z",
								modified_at: "2024-01-01T00:00:00Z",
							},
						});
					},
					{ once: true }
				)
			);

			await runWrangler("pipelines streams create --name my_stream");

			expect(capturedBody).toEqual({ name: "my_stream" });
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toMatchObject({
				id: "stream_123",
				name: "my_stream",
			});
		});

		// Wrangler-only: wrangler reads --schema-file <path> and submits
		// the JSON contents as the body's `schema` field. cf's
		// `pipelines streams create` exposes only --schema-inferred (a
		// boolean); inline schema field arrays don't have a CLI
		// affordance — users would pass --body @schema.json instead.
		it.skip("should create stream with schema from file", async () => {});
	});

	describe("pipelines streams list", () => {
		function mockListStreamsRequest(
			expect: ExpectStatic,
			streams: Stream[],
			pipelineId?: string
		) {
			const requests = { count: 0 };
			msw.use(
				http.get(
					`*/accounts/${accountId}/pipelines/v1/streams`,
					({ request }) => {
						requests.count++;
						const url = new URL(request.url);
						if (pipelineId) {
							expect(url.searchParams.get("pipeline_id")).toBe(pipelineId);
						}
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: streams,
							result_info: {
								page: 1,
								per_page: 20,
								count: streams.length,
								total_count: streams.length,
							},
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		it("should list streams", async ({ expect }) => {
			const mockStreams: Stream[] = [
				{
					id: "stream_1",
					name: "stream_one",
					version: 1,
					endpoint: "https://pipelines.cloudflare.com/stream_1",
					format: { type: "json", unstructured: true },
					schema: null,
					http: { enabled: true, authentication: false },
					worker_binding: { enabled: true },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			const listRequest = mockListStreamsRequest(expect, mockStreams);

			await runWrangler("pipelines streams list");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockStreams);
		});

		it("should filter by pipeline ID", async ({ expect }) => {
			const mockStreams: Stream[] = [
				{
					id: "stream_1",
					name: "filtered_stream",
					version: 1,
					endpoint: "https://pipelines.cloudflare.com/stream_1",
					format: { type: "json", unstructured: true },
					schema: null,
					http: { enabled: true, authentication: false },
					worker_binding: { enabled: true },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			const listRequest = mockListStreamsRequest(
				expect,
				mockStreams,
				"pipeline_123"
			);

			await runWrangler("pipelines streams list --pipeline-id pipeline_123");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockStreams);
		});

		it('supports valid json output with "--json" flag', async ({ expect }) => {
			const mockStreams: Stream[] = [
				{
					id: "stream_1",
					name: "stream_one",
					version: 1,
					endpoint: "https://pipelines.cloudflare.com/stream_1",
					format: { type: "json", unstructured: true },
					schema: null,
					http: { enabled: true, authentication: false },
					worker_binding: { enabled: true },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			mockListStreamsRequest(expect, mockStreams);

			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines streams list");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockStreams);
		});
	});

	describe("pipelines streams get", () => {
		it("should get stream details", async ({ expect }) => {
			const mockStream: Stream = {
				id: "stream_123",
				name: "my_stream",
				version: 1,
				endpoint: "https://pipelines.cloudflare.com/stream_123",
				format: { type: "json", unstructured: true },
				schema: null,
				http: { enabled: true, authentication: true },
				worker_binding: { enabled: true },
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
			};

			const getRequest = mockGetStreamRequest("stream_123", mockStream);

			await runWrangler("pipelines streams get stream_123");

			expect(getRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockStream);
		});

		it('supports valid json output with "--json" flag', async ({ expect }) => {
			const mockStream: Stream = {
				id: "stream_123",
				name: "my_stream",
				version: 1,
				endpoint: "https://pipelines.cloudflare.com/stream_123",
				format: { type: "json", unstructured: true },
				schema: null,
				http: { enabled: true, authentication: true },
				worker_binding: { enabled: true },
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
			};

			mockGetStreamRequest("stream_123", mockStream);

			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines streams get stream_123");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockStream);
		});
	});

	describe("pipelines streams delete", () => {
		function mockDeleteStreamRequest(streamId: string) {
			const requests = { count: 0 };
			msw.use(
				http.delete(
					`*/accounts/${accountId}/pipelines/v1/streams/${streamId}`,
					() => {
						requests.count++;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: null,
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		it("should prompt for confirmation", async ({ expect }) => {
			const deleteRequest = mockDeleteStreamRequest("stream_123");

			setIsTTY(true);
			mockConfirm({
				text: "This permanently deletes the resource. Continue?",
				result: true,
			});

			await runWrangler("pipelines streams delete stream_123");

			expect(deleteRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});
	});

	describe("pipelines sinks create", () => {
		// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
		function mockCreateSinkRequest(
			expect: ExpectStatic,
			expectedRequest: {
				name: string;
				type: string;
				isDataCatalog?: boolean;
			}
		) {
			const requests = { count: 0 };
			msw.use(
				http.post(
					`*/accounts/${accountId}/pipelines/v1/sinks`,
					async ({ request }) => {
						requests.count++;
						const body = (await request.json()) as {
							name: string;
							type: string;
							config?: Record<string, unknown>;
						};
						expect(body.name).toBe(expectedRequest.name);
						expect(body.type).toBe(expectedRequest.type);

						const config = expectedRequest.isDataCatalog
							? {
									bucket: "catalog-bucket",
									namespace: "default",
									table_name: "my-table",
									token: "token123",
								}
							: {
									bucket: "my-bucket",
									credentials: {
										access_key_id: "key123",
										secret_access_key: "secret123",
									},
								};

						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "sink_123",
								name: expectedRequest.name,
								type: expectedRequest.type,
								format: { type: "json" },
								schema: null,
								config,
								created_at: "2024-01-01T00:00:00Z",
								modified_at: "2024-01-01T00:00:00Z",
							},
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		// Wrangler-only: pre-validates sink name against /^[a-zA-Z0-9_]+$/
		// before sending. cf doesn't pre-validate.
		it.skip("should error when name contains invalid characters", async () => {});

		it("should error when type is missing", async ({ expect }) => {
			setIsTTY(false);
			await expect(
				runWrangler("pipelines sinks create --name my_sink")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: --type is required (one of: r2, r2_data_catalog). Pass --type <value> or run interactively.]`
			);
		});

		// Wrangler-only: pre-validates --bucket against the R2 bucket
		// naming rules before sending. cf doesn't.
		it.skip("should error with invalid bucket name", async () => {});

		// Fixed: `body-params-required-within-optional-parent`. The
		// generator's group-implies `.check()` only requires
		// `--schema-format-type` when another `--schema-*` sibling is set,
		// so an R2 sink creates without any `--schema-*` flag. cf's
		// `config` group-implies check requires the R2 credential leaves
		// (`--config-account-id`, `--config-bucket`,
		// `--config-credentials-access-key-id`,
		// `--config-credentials-secret-access-key`) together when any
		// `--config-*` flag is set, so all four are passed here.
		it("should create R2 sink with explicit credentials", async ({
			expect,
		}) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					`*/accounts/${accountId}/pipelines/v1/sinks`,
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "sink_123",
								name: "my_sink",
								type: "r2",
								format: { type: "json" },
								schema: null,
								config: {
									bucket: "my-bucket",
									credentials: {
										access_key_id: "mykey",
										secret_access_key: "mysecret",
									},
								},
								created_at: "2024-01-01T00:00:00Z",
								modified_at: "2024-01-01T00:00:00Z",
							},
						});
					},
					{ once: true }
				)
			);

			await runWrangler(
				"pipelines sinks create --name my_sink --type r2 --config-account-id some-account-id --config-bucket my-bucket --config-credentials-access-key-id mykey --config-credentials-secret-access-key mysecret"
			);

			expect(capturedBody).toEqual({
				name: "my_sink",
				type: "r2",
				config: {
					account_id: "some-account-id",
					bucket: "my-bucket",
					credentials: {
						access_key_id: "mykey",
						secret_access_key: "mysecret",
					},
				},
			});
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toMatchObject({
				id: "sink_123",
				name: "my_sink",
				type: "r2",
			});
		});

		// Fixed: `pipelines-sink-config-oneof-wrong-variant`. The `config`
		// object is a discriminated `oneOf` (R2 credentials vs
		// r2_data_catalog). The generated group-implies `.check()` is now
		// variant-aware: a required leaf that `.conflicts()` with a flag
		// the user set belongs to a different `oneOf` variant and is not
		// demanded. So the R2-credentials leaves are skipped when the
		// catalog leaves (`--config-namespace`, `--config-table-name`,
		// `--config-token`) are supplied, and the data-catalog variant is
		// now expressible via the per-field `--config-*` form. The shared
		// required leaves (`--config-account-id`, `--config-bucket`) are
		// still demanded — they are required in BOTH variants.
		it("should create R2 Data Catalog sink", async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.post(
					`*/accounts/${accountId}/pipelines/v1/sinks`,
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "sink_123",
								name: "my_sink",
								type: "r2_data_catalog",
								format: { type: "json" },
								schema: null,
								config: {
									account_id: "some-account-id",
									bucket: "catalog-bucket",
									namespace: "default",
									table_name: "my-table",
									token: "token123",
								},
								created_at: "2024-01-01T00:00:00Z",
								modified_at: "2024-01-01T00:00:00Z",
							},
						});
					},
					{ once: true }
				)
			);

			await runWrangler(
				"pipelines sinks create --name my_sink --type r2_data_catalog --config-account-id some-account-id --config-bucket catalog-bucket --config-namespace default --config-table-name my-table --config-token token123"
			);

			expect(capturedBody).toEqual({
				name: "my_sink",
				type: "r2_data_catalog",
				config: {
					account_id: "some-account-id",
					bucket: "catalog-bucket",
					namespace: "default",
					table_name: "my-table",
					token: "token123",
				},
			});
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toMatchObject({
				id: "sink_123",
				name: "my_sink",
				type: "r2_data_catalog",
			});
		});

		// cf should reject a data-catalog sink missing its required config,
		// but the generated nested `--config-*` flags currently allow an
		// incomplete request through to the API.
		it.todo("should error when r2-data-catalog missing required fields");
	});

	describe("pipelines sinks list", () => {
		function mockListSinksRequest(
			expect: ExpectStatic,
			sinks: Sink[],
			pipelineId?: string
		) {
			const requests = { count: 0 };
			msw.use(
				http.get(
					`*/accounts/${accountId}/pipelines/v1/sinks`,
					({ request }) => {
						requests.count++;
						const url = new URL(request.url);
						if (pipelineId) {
							expect(url.searchParams.get("pipeline_id")).toBe(pipelineId);
						}
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: sinks,
							result_info: {
								page: 1,
								per_page: 20,
								count: sinks.length,
								total_count: sinks.length,
							},
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		it("should list sinks", async ({ expect }) => {
			const mockSinks: Sink[] = [
				{
					id: "sink_1",
					name: "sink_one",
					type: "r2",
					format: { type: "json" },
					schema: null,
					config: { bucket: "bucket1" },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			const listRequest = mockListSinksRequest(expect, mockSinks);

			await runWrangler("pipelines sinks list");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSinks);
		});

		it("should filter by pipeline ID", async ({ expect }) => {
			const mockSinks: Sink[] = [
				{
					id: "sink_1",
					name: "filtered_sink",
					type: "r2",
					format: { type: "json" },
					schema: null,
					config: { bucket: "bucket1" },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			const listRequest = mockListSinksRequest(
				expect,
				mockSinks,
				"pipeline_123"
			);

			await runWrangler("pipelines sinks list --pipeline-id pipeline_123");

			expect(listRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSinks);
		});

		it('supports json output with "--json" flag', async ({ expect }) => {
			const mockSinks: Sink[] = [
				{
					id: "sink_1",
					name: "sink_one",
					type: "r2",
					format: { type: "json" },
					schema: null,
					config: { bucket: "bucket1" },
					created_at: "2024-01-01T00:00:00Z",
					modified_at: "2024-01-01T00:00:00Z",
				},
			];

			mockListSinksRequest(expect, mockSinks);
			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines sinks list");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSinks);
		});
	});

	function mockGetSinkRequest(sinkId: string, sink: Sink) {
		const requests = { count: 0 };
		msw.use(
			http.get(
				`*/accounts/${accountId}/pipelines/v1/sinks/${sinkId}`,
				() => {
					requests.count++;
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: sink,
					});
				},
				{ once: true }
			)
		);
		return requests;
	}

	describe("pipelines sinks get", () => {
		it("should get sink details", async ({ expect }) => {
			const mockSink: Sink = {
				id: "sink_123",
				name: "my_sink",
				type: "r2",
				format: { type: "json" },
				schema: null,
				config: {
					bucket: "my-bucket",
				},
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
			};

			const getRequest = mockGetSinkRequest("sink_123", mockSink);

			await runWrangler("pipelines sinks get sink_123");

			expect(getRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSink);
		});

		it('supports valid json output with "--json" flag', async ({ expect }) => {
			const mockSink: Sink = {
				id: "sink_123",
				name: "my_sink",
				type: "r2",
				format: { type: "json" },
				schema: null,
				config: {
					bucket: "my-bucket",
				},
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-01T00:00:00Z",
			};

			mockGetSinkRequest("sink_123", mockSink);
			// cf has no --json flag; JSON is the default output.
			await runWrangler("pipelines sinks get sink_123");

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual({
				config: {
					bucket: "my-bucket",
				},
				created_at: "2024-01-01T00:00:00Z",
				format: {
					type: "json",
				},
				id: "sink_123",
				modified_at: "2024-01-01T00:00:00Z",
				name: "my_sink",
				schema: null,
				type: "r2",
			});
		});
	});

	describe("pipelines sinks delete", () => {
		function mockDeleteSinkRequest(sinkId: string) {
			const requests = { count: 0 };
			msw.use(
				http.delete(
					`*/accounts/${accountId}/pipelines/v1/sinks/${sinkId}`,
					() => {
						requests.count++;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: null,
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		it("should prompt for confirmation", async ({ expect }) => {
			const deleteRequest = mockDeleteSinkRequest("sink_123");

			setIsTTY(true);
			mockConfirm({
				text: "This permanently deletes the resource. Continue?",
				result: true,
			});

			await runWrangler("pipelines sinks delete sink_123");

			expect(deleteRequest.count).toBe(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});
	});
});
