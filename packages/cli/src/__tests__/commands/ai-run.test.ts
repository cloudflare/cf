import { readFileSync, writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getModelInputSchema } from "../../commands/ai/run/schema.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import type { Cloudflare } from "../../lib/auth.js";
import type * as PromptModule from "../../lib/prompt.js";

const promptMocks = vi.hoisted(() => ({
	enabled: false,
	requiredEnum: vi.fn(),
	requiredField: vi.fn(),
}));
vi.mock("#lib/prompt.js", async (importOriginal) => {
	const original = await importOriginal<typeof PromptModule>();
	return {
		...original,
		promptForRequiredEnumField: (
			...args: Parameters<typeof original.promptForRequiredEnumField>
		) =>
			promptMocks.enabled
				? promptMocks.requiredEnum(...args)
				: original.promptForRequiredEnumField(...args),
		promptForRequiredField: (
			...args: Parameters<typeof original.promptForRequiredField>
		) =>
			promptMocks.enabled
				? promptMocks.requiredField(...args)
				: original.promptForRequiredField(...args),
	};
});

/**
 * `cf ai run` is hand-written, so it needs coverage on two fronts: the
 * failure modes of fetching a schema at run time — each
 * must degrade to `--body` rather than crash or hang — and drift, since
 * nothing regenerates this command when the spec moves.
 */

const MODEL = "@cf/test/tiny";

const INPUT_SCHEMA = {
	type: "object",
	properties: {
		prompt: { type: "string", description: "The input text prompt" },
		max_tokens: { type: "number", description: "Token budget" },
		speed: { type: "string", enum: ["fast", "slow"], description: "Speed" },
		mode: { type: "string", enum: ["fast", "slow"], description: "Mode" },
	},
	required: ["prompt"],
};

describe("cf ai run", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CI: "true",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;

	let output: ReturnType<typeof captureOutput>;
	let schemaRequests: string[];
	let schemaAuthorization: string | null;
	let runBodies: unknown[];
	let runModels: unknown[];
	let runUrls: string[];

	beforeEach(() => {
		output = captureOutput();
		schemaRequests = [];
		schemaAuthorization = null;
		runBodies = [];
		runModels = [];
		runUrls = [];
		promptMocks.enabled = false;
		promptMocks.requiredEnum.mockReset();
		promptMocks.requiredField.mockReset();
	});

	afterEach(() => vi.restoreAllMocks());

	const stdout = () => output.stdout();

	/** Models-schema endpoint, recording each lookup. */
	function schemaHandler(status = 200, input: unknown = INPUT_SCHEMA) {
		return http.get(`${ACCT}/ai/models/schema`, ({ request }) => {
			schemaRequests.push(new URL(request.url).searchParams.get("model") ?? "");
			schemaAuthorization = request.headers.get("authorization");
			return status === 200
				? HttpResponse.json({
						success: true,
						errors: [],
						result: { input, output: { type: "object" } },
					})
				: HttpResponse.json(
						{ success: false, errors: [{ code: 7000, message: "not found" }] },
						{ status }
					);
		});
	}

	/** Inference endpoint, recording each request body. */
	function runHandler() {
		return http.post(/\/ai\/run$/, async ({ request }) => {
			runUrls.push(request.url);
			const body = (await request.json()) as {
				model?: unknown;
				input?: unknown;
			};
			runModels.push(body.model);
			runBodies.push(body.input);
			return HttpResponse.json({
				success: true,
				errors: [],
				result: { response: "hi" },
			});
		});
	}

	function rawRunHandler(bytes: Uint8Array) {
		return http.post(
			/\/ai\/run$/,
			() =>
				new HttpResponse(bytes, {
					headers: { "content-type": "audio/wav" },
				})
		);
	}

	function run(...args: string[]) {
		return runCf(["ai", "run", ...args], ENV);
	}

	it("assembles the request body from the model's own schema", async () => {
		server.use(schemaHandler(), runHandler());

		const { exitCode } = await run(
			MODEL,
			"--prompt",
			"hello",
			"--max-tokens",
			"64"
		);

		expect(exitCode).toBe(0);
		expect(schemaRequests).toEqual([MODEL]);
		expect(runModels).toEqual([MODEL]);
		expect(runBodies).toEqual([{ prompt: "hello", max_tokens: 64 }]);
		expect(new URL(runUrls[0] ?? TEST_BASE_URL).pathname).toMatch(/\/ai\/run$/);
		expect(stdout()).toContain("hi");
	});

	it("writes non-JSON model output as exact bytes", async () => {
		const bytes = Uint8Array.from([82, 73, 70, 70, 0, 255, 128]);
		const write = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
		server.use(schemaHandler(), rawRunHandler(bytes));

		const { exitCode } = await run(MODEL, "--prompt", "hello");

		expect(exitCode).toBe(0);
		expect(write).toHaveBeenCalledWith(Buffer.from(bytes));
	});

	it("parses array and object flags as JSON values", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					messages: {
						oneOf: [
							{ type: "array", items: { type: "string" } },
							{ type: "array", items: { type: "object" } },
						],
					},
					response_format: { type: "object" },
				},
				required: ["messages"],
			}),
			runHandler()
		);

		await run(
			MODEL,
			"--messages",
			'[{"role":"user","content":"hi"}]',
			"--response-format",
			'{"type":"json_object"}'
		);

		expect(runBodies).toEqual([
			{
				messages: [{ role: "user", content: "hi" }],
				response_format: { type: "json_object" },
			},
		]);
		await expect(run(MODEL, "--messages", '{"role":"user"}')).rejects.toThrow(
			/expects a JSON array/
		);
	});

	it("validates flattened parent and array constraints before inference", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					options: {
						type: "object",
						minProperties: 2,
						properties: { mode: { type: "string" } },
					},
					labels: {
						type: "array",
						minItems: 2,
						items: { type: "string", pattern: "^ok:" },
					},
				},
			}),
			runHandler()
		);

		await expect(
			run(MODEL, "--options-mode", "strict", "--labels", '["invalid"]')
		).rejects.toThrow(
			/`\/labels` must contain at least 2 items.*`\/labels\/0` does not match the required format.*`\/options` must contain at least 2 properties/s
		);
		expect(runBodies).toEqual([]);
	});

	it("validates complete alternative shapes after flag assembly", async () => {
		server.use(
			schemaHandler(200, {
				oneOf: [
					{
						type: "object",
						required: ["labels"],
						properties: {
							labels: {
								type: "array",
								items: { type: "string", pattern: "^a" },
							},
						},
					},
					{
						type: "object",
						required: ["labels"],
						properties: {
							labels: {
								type: "array",
								items: { type: "string", pattern: "^b" },
							},
						},
					},
				],
			}),
			runHandler()
		);

		await expect(run(MODEL, "--labels", '["z"]')).rejects.toThrow(
			/the request body must match exactly one allowed shape/
		);
		await run(MODEL, "--labels", '["a-value"]');
		expect(runBodies).toEqual([{ labels: ["a-value"] }]);
	});

	it("defers complete validation when a schema uses unsupported keywords", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					values: {
						oneOf: [
							{ type: "array", contains: { const: "required" } },
							{ type: "array", items: { type: "number" } },
						],
					},
				},
			}),
			runHandler()
		);

		await run(MODEL, "--values", "[1]");
		expect(runBodies).toEqual([{ values: [1] }]);
	});

	it("retains supported field validation when another field is unsupported", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					count: { type: "integer", multipleOf: 2 },
					labels: {
						type: "array",
						items: { type: "string", pattern: "^ok:" },
					},
					url: { type: "string", format: "uri" },
				},
			}),
			runHandler()
		);

		await expect(
			run(MODEL, "--count", "3", "--url", "not-a-uri")
		).rejects.toThrow(/`\/count` must be a multiple of 2/);
		await expect(
			run(MODEL, "--labels", '["invalid"]', "--url", "not-a-uri")
		).rejects.toThrow(/`\/labels\/0` does not match the required format/);
		await run(
			MODEL,
			"--count",
			"4",
			"--labels",
			'["ok:value"]',
			"--url",
			"not-a-uri"
		);

		expect(runBodies).toEqual([
			{ count: 4, labels: ["ok:value"], url: "not-a-uri" },
		]);
	});

	it("retains supported constraints beside an unsupported field keyword", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					values: {
						type: "array",
						minItems: 2,
						contains: { const: "required" },
					},
				},
			}),
			runHandler()
		);

		await expect(run(MODEL, "--values", "[]")).rejects.toThrow(
			/`\/values` must contain at least 2 items/
		);
		expect(runBodies).toEqual([]);
	});

	it("validates partial schemas in whole-body alternative context", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					url: { type: "string", format: "uri" },
				},
				anyOf: [
					{
						properties: {
							values: {
								type: "array",
								items: { type: "integer", multipleOf: 2 },
							},
						},
					},
					{
						required: ["kind"],
						properties: { kind: { const: "other" } },
					},
				],
			}),
			runHandler()
		);

		await run(
			MODEL,
			"--url",
			"https://example.com",
			"--kind",
			"other",
			"--values",
			"[3]"
		);

		expect(runBodies).toEqual([
			{ url: "https://example.com", kind: "other", values: [3] },
		]);
	});

	it("does not activate a conditional whose predicate is unsupported", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: { kind: { type: "string" } },
				if: {
					required: ["kind"],
					properties: { kind: { type: "string", format: "uuid" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					required: ["count"],
					properties: { count: { type: "integer", minimum: 2 } },
				},
			}),
			runHandler()
		);

		await run(MODEL, "--kind", "not-a-uuid");
		expect(runBodies).toEqual([{ kind: "not-a-uuid" }]);
	});

	it("retains supported consequences of an exact conditional", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: { kind: { type: "string" } },
				if: {
					required: ["kind"],
					properties: { kind: { const: "selected" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					properties: {
						values: {
							type: "array",
							items: { type: "integer", multipleOf: 2 },
							contains: { const: 2 },
						},
					},
				},
			}),
			runHandler()
		);

		await expect(
			run(MODEL, "--kind", "selected", "--values", "[3]")
		).rejects.toThrow(/`\/values\/0` must be a multiple of 2/);
		expect(runBodies).toEqual([]);
	});

	it("accepts string-or-array fields without dropping either variant", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					text: {
						oneOf: [{ type: "string" }, { type: "array" }],
					},
				},
				required: ["text"],
			}),
			runHandler()
		);

		await run(MODEL, "--text", "one sentence");
		await run(MODEL, "--text", '["first","second"]');

		expect(runBodies).toEqual([
			{ text: "one sentence" },
			{ text: ["first", "second"] },
		]);
	});

	it("does not require children of an optional object", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					prompt: { type: "string" },
					response_format: {
						type: "object",
						properties: { type: { type: "string" } },
						required: ["type"],
					},
				},
				required: ["prompt"],
			}),
			runHandler()
		);

		await run(MODEL, "--prompt", "hi");
		await run(MODEL, "--prompt", "hi", "--response-format-type", "json_object");

		expect(runBodies).toEqual([
			{ prompt: "hi" },
			{ prompt: "hi", response_format: { type: "json_object" } },
		]);
	});

	it("flattens a nested object into kebab-joined flags", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					prompt: { type: "string" },
					web_search_options: {
						type: "object",
						properties: {
							user_location: {
								type: "object",
								properties: { city: { type: "string" } },
							},
						},
					},
				},
				required: ["prompt"],
			}),
			runHandler()
		);

		await run(
			MODEL,
			"--prompt",
			"hi",
			"--web-search-options-user-location-city",
			"London"
		);

		expect(runBodies).toEqual([
			{
				prompt: "hi",
				web_search_options: { user_location: { city: "London" } },
			},
		]);
	});

	it("sends a field the schema doesn't constrain as JSON, not as text", async () => {
		// `response_format.json_schema` is `{}` in the real Workers AI
		// schemas: anything goes, so the value has to survive as the JSON it
		// is rather than arriving quoted.
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: {
					prompt: { type: "string" },
					response_format: {
						type: "object",
						properties: {
							type: { type: "string" },
							json_schema: {},
						},
					},
				},
				required: ["prompt"],
			}),
			runHandler()
		);

		await run(
			MODEL,
			"--prompt",
			"hi",
			"--response-format-type",
			"json_schema",
			"--response-format-json-schema",
			'{"type":"object"}'
		);
		// A value that isn't JSON is still a legitimate value for a field
		// that constrains nothing.
		await run(
			MODEL,
			"--prompt",
			"hi",
			"--response-format-json-schema",
			"passthrough"
		);

		expect(runBodies).toEqual([
			{
				prompt: "hi",
				response_format: {
					type: "json_schema",
					json_schema: { type: "object" },
				},
			},
			{ prompt: "hi", response_format: { json_schema: "passthrough" } },
		]);
	});

	it("rejects a flag the model doesn't accept", async () => {
		server.use(schemaHandler());

		await expect(
			run(MODEL, "--prompt", "hi", "--promptt", "typo")
		).rejects.toThrow(/Unknown flag --promptt/);
		expect(runBodies).toEqual([]);
	});

	it("rejects local execution before schema discovery", async () => {
		await expect(run(MODEL, "--local")).rejects.toMatchObject({
			message:
				"This command has no local equivalent. Re-run without --local to use the Cloudflare API.",
		});
		expect(schemaRequests).toEqual([]);
		expect(runBodies).toEqual([]);
	});

	it("rejects the schema's own spelling of a field name", async () => {
		server.use(schemaHandler());

		// Schema fields are snake_case, flags are kebab-case. `--max_tokens`
		// is a mistake, the same as it would be on a generated command under
		// `yargs.strict()`, and the error names the flag as typed.
		await expect(
			run(MODEL, "--prompt", "hi", "--max_tokens", "64")
		).rejects.toThrow(/Unknown flag --max_tokens/);
		expect(runBodies).toEqual([]);
	});

	it("enforces required fields and enum choices", async () => {
		server.use(schemaHandler());

		await expect(run(MODEL, "--max-tokens", "64")).rejects.toThrow(
			/--prompt is required/
		);
		await expect(
			run(MODEL, "--prompt", "hi", "--speed", "turbo")
		).rejects.toThrow(/--speed must be one of: fast, slow/);
	});

	it("prompts for requirements activated by an interactive answer", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				required: ["kind"],
				properties: {
					kind: { type: "string", enum: ["basic", "advanced"] },
					instructions: { type: "string" },
				},
				if: {
					required: ["kind"],
					properties: { kind: { const: "advanced" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: { required: ["instructions"] },
			}),
			runHandler()
		);
		promptMocks.enabled = true;
		promptMocks.requiredEnum.mockResolvedValueOnce("advanced");
		promptMocks.requiredField.mockResolvedValueOnce("Use citations");

		const { exitCode } = await run(MODEL);

		expect(exitCode).toBe(0);
		expect(promptMocks.requiredEnum).toHaveBeenCalledOnce();
		expect(promptMocks.requiredEnum).toHaveBeenCalledWith(
			"kind",
			"Kind",
			["basic", "advanced"],
			undefined
		);
		expect(promptMocks.requiredField).toHaveBeenCalledOnce();
		expect(promptMocks.requiredField).toHaveBeenCalledWith(
			"instructions",
			"Instructions"
		);
		expect(runBodies).toEqual([
			{ kind: "advanced", instructions: "Use citations" },
		]);
	});

	it("stops prompting when an activated requirement has no prompt type", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				required: ["kind"],
				properties: {
					kind: { type: "string", enum: ["basic", "advanced"] },
					iterations: { type: "number" },
				},
				if: {
					required: ["kind"],
					properties: { kind: { const: "advanced" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: { required: ["iterations"] },
			}),
			runHandler()
		);
		promptMocks.enabled = true;
		promptMocks.requiredEnum.mockResolvedValueOnce("advanced");

		await expect(run(MODEL)).rejects.toThrow(/--iterations is required/);
		expect(promptMocks.requiredEnum).toHaveBeenCalledOnce();
		expect(promptMocks.requiredField).not.toHaveBeenCalled();
		expect(runBodies).toEqual([]);
	});

	it("caches the schema between runs", async () => {
		server.use(schemaHandler(), runHandler());

		await run(MODEL, "--prompt", "one");
		await run(MODEL, "--prompt", "two");

		expect(schemaRequests).toEqual([MODEL]);
		expect(runBodies).toHaveLength(2);
	});

	it("sends --body unvalidated when the schema can't be loaded", async () => {
		server.use(schemaHandler(404), runHandler());

		const { exitCode } = await run(MODEL, "--body", '{"anything":true}');

		expect(exitCode).toBe(0);
		expect(schemaRequests).toEqual([]);
		expect(runBodies).toEqual([{ anything: true }]);
	});

	it("points at --body when the schema is missing but flags were passed", async () => {
		server.use(schemaHandler(404));

		await expect(run(MODEL, "--prompt", "hi")).rejects.toThrow(
			/Could not load the input schema/
		);
		expect(runBodies).toEqual([]);
	});

	it("uses the SDK's normal request policy outside help", async () => {
		const get = vi.fn().mockResolvedValue({ input: INPUT_SCHEMA });
		const client = {
			ai: { getModelSchema: get },
		} as unknown as Cloudflare;

		await expect(
			getModelInputSchema(
				"@cf/test/normal-policy",
				"normal-policy-account",
				async () => client
			)
		).resolves.toMatchObject({ ok: true });
		expect(get).toHaveBeenCalledWith({
			account_id: "normal-policy-account",
			model: "@cf/test/normal-policy",
		});
	});

	it("refuses --body mixed with model input flags", async () => {
		await expect(run(MODEL, "--body", "{}", "--prompt", "hi")).rejects.toThrow(
			/--body cannot be combined with model input flags/
		);
		expect(schemaRequests).toEqual([]);
	});

	it("does not treat the global mode as model input", async () => {
		server.use(schemaHandler(), runHandler());

		await run(MODEL, "--prompt", "hi", "--mode", "staging");

		expect(runBodies).toEqual([{ prompt: "hi" }]);
	});

	it("degrades cleanly when the API returns a malformed schema", async () => {
		server.use(
			schemaHandler(200, {
				type: "object",
				properties: { prompt: null },
			})
		);

		await expect(run(MODEL, "--prompt", "hi")).rejects.toThrow(
			/Could not load the input schema/
		);
	});

	it("validates and previews without running under --dry-run", async () => {
		// No run handler: `onUnhandledRequest: "error"` proves nothing was
		// sent to the inference endpoint.
		server.use(schemaHandler());

		const { exitCode } = await run(MODEL, "--prompt", "hi", "--dry-run");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain('"prompt": "hi"');
		expect(stdout()).toContain("/ai/run");
		expect(stdout()).toContain(`"model": "${MODEL}"`);
		expect(stdout()).toContain('"input"');

		await expect(run(MODEL, "--max-tokens", "64", "--dry-run")).rejects.toThrow(
			/--prompt is required/
		);
	});

	it("makes no request for `--help` without a model", async () => {
		// No handlers at all: any outbound request fails the test.
		const { exitCode } = await run("--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("cf ai run [model-name]");
		expect(schemaRequests).toEqual([]);
	});

	it("shows the local-mode rejection before offline help", async () => {
		// No state directory and no request handlers: this covers both the
		// global middleware exception and the command's schema lookup.
		const { exitCode } = await run(MODEL, "--local", "--help");

		expect(exitCode).toBe(0);
		expect(schemaRequests).toEqual([]);
		const localMessage =
			"This command has no local equivalent. Re-run without --local to use the Cloudflare API.";
		expect(stdout()).toContain(localMessage);
		expect(stdout().indexOf(localMessage)).toBeLessThan(
			stdout().indexOf("cf ai run [model-name]")
		);
	});

	it("lists the model's input flags for `<model> --help`", async () => {
		server.use(schemaHandler());

		const { exitCode } = await run(MODEL, "--help");

		expect(exitCode).toBe(0);
		expect(schemaRequests).toEqual([MODEL]);
		expect(stdout()).toContain(`Input flags for ${MODEL}`);
		expect(stdout()).toMatch(
			/--prompt\s+The input text prompt \[string\] \[required\]/
		);
		expect(stdout()).toContain("[choices: fast, slow]");
	});

	it("loads file-sourced credentials for qualified help", async () => {
		writeFileSync(
			".env",
			[
				"CLOUDFLARE_API_TOKEN=file-token",
				"CLOUDFLARE_ACCOUNT_ID=test-account",
			].join("\n")
		);
		server.use(schemaHandler());

		const { exitCode } = await runCf(["ai", "run", MODEL, "--help"], {
			CI: "true",
			CLOUDFLARE_API_TOKEN: undefined,
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_ACCOUNT_ID: undefined,
		});

		expect(exitCode).toBe(0);
		expect(schemaRequests).toEqual([MODEL]);
		expect(schemaAuthorization).toBe("Bearer file-token");
		expect(stdout()).toContain(`Input flags for ${MODEL}`);
		expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();
	});

	it("degrades `--help` when the schema 404s", async () => {
		server.use(schemaHandler(404));

		const { exitCode } = await run(MODEL, "--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("cf ai run [model-name]");
		expect(stdout()).toMatch(/Could not load the input flags/);
	});

	it("points a rejected token at `cf auth login`", async () => {
		// The account resolves — from the environment here — so the command
		// gets far enough to be turned away by the API rather than stopping
		// at the no-account message.
		server.use(schemaHandler(401));

		const { exitCode } = await run(MODEL, "--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("cf auth login");
	});

	it("points a token without the scope at its permissions", async () => {
		server.use(schemaHandler(403));

		const { exitCode } = await run(MODEL, "--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("check your API token permissions");
		expect(stdout()).not.toContain("cf auth login");
	});

	it("degrades `--help` without credentials, and does not prompt", async () => {
		const { exitCode } = await runCf(["ai", "run", MODEL, "--help"], {
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_API_TOKEN: undefined,
			CLOUDFLARE_ACCOUNT_ID: undefined,
		});

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("`cf auth login`");
		expect(schemaRequests).toEqual([]);
	});

	it("uses the only authorised account for qualified help", async () => {
		const accountRequests: string[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}/accounts`, ({ request }) => {
				accountRequests.push(new URL(request.url).pathname);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [{ id: "test-account", name: "Test Account" }],
				});
			}),
			http.get(`${TEST_BASE_URL}/memberships`, ({ request }) => {
				accountRequests.push(new URL(request.url).pathname);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [{ account: { id: "test-account", name: "Test Account" } }],
				});
			}),
			schemaHandler()
		);
		const { exitCode } = await runCf(["ai", "run", MODEL, "--help"], {
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_API_TOKEN: "test-token",
			CLOUDFLARE_ACCOUNT_ID: undefined,
		});

		expect(exitCode).toBe(0);
		expect(accountRequests.sort()).toEqual([
			"/client/v4/accounts",
			"/client/v4/memberships",
		]);
		expect(schemaRequests).toEqual([MODEL]);
		expect(stdout()).toContain(`Input flags for ${MODEL}`);
	});
});

/**
 * Drift guard: this command is hand-written, so a change to
 * `/ai/run` no longer regenerates it. Compares its
 * assumptions against the generated `_meta/*.json`, which does track the
 * spec — if this fails, the command needs updating.
 */
describe("cf ai run — spec drift guard", () => {
	function readJson<T>(relative: string): T {
		return JSON.parse(
			readFileSync(new URL(relative, import.meta.url), "utf-8")
		) as T;
	}

	const schemas = readJson<{
		schemas: Record<
			string,
			{
				operationId: string;
				httpMethod: string;
				path: string;
				pathParams: { name: string; required: boolean }[];
				hasRequestBody: boolean;
				requestBodyFields: { name: string; required: boolean }[];
			}
		>;
	}>("../../commands/_generated/_meta/schemas.json").schemas;
	const spec = schemas["ai run"];

	it("still targets POST /accounts/{account_id}/ai/run", () => {
		expect(spec).toBeDefined();
		expect(spec?.httpMethod).toBe("POST");
		expect(spec?.path).toBe("/accounts/{account_id}/ai/run");
		expect(spec?.operationId).toBe("workers-ai-post-run-generic");
		expect(spec?.hasRequestBody).toBe(true);
		expect(spec?.requestBodyFields).toContainEqual(
			expect.objectContaining({ name: "model", required: true })
		);
	});

	it("publishes the hand-written metadata, merged over the spec", () => {
		const metadataSpec = schemas["ai run"];
		const entry = readJson<{
			commands: {
				command: string;
				description: string;
				usage: string;
				apiPath?: string;
			}[];
		}>("../../commands/_generated/_meta/commands.json").commands.find(
			(c) => c.command === "cf ai run"
		);
		// Prose and usage come from the sidecar…
		expect(entry?.usage).toContain("--<model-field>");
		expect(entry?.description).toContain("cf ai get-model-schema --model <id>");
		// …identity from the spec, so it can't drift out of the sidecar.
		expect(entry?.apiPath).toBe(metadataSpec?.path);
	});
});
