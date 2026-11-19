import { writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { buildCli } from "../../index.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const agent = vi.hoisted(() => ({
	harness: null as { id: string; name: string } | null,
}));

vi.mock("../../lib/agent-context.js", () => ({
	detectAgentContext: () => ({
		isAgentic: agent.harness !== null,
		harness: agent.harness,
		model: null,
		sessionId: agent.harness ? "session-secret" : null,
		invocationId: null,
		matches: [],
	}),
}));

const FEEDBACK_URL = "https://api.cloudflare.com/client/v4/feedback/send";

type Sent = { body: Record<string, unknown>; headers: Headers };

/** Records every request and replies with each response in turn (the last one repeats). */
function respondWith(...responses: Array<() => Response>): Sent[] {
	const sent: Sent[] = [];
	server.use(
		http.post(FEEDBACK_URL, async ({ request }) => {
			sent.push({
				body: (await request.json()) as Record<string, unknown>,
				headers: request.headers,
			});
			const respond =
				responses[Math.min(sent.length - 1, responses.length - 1)];
			return respond ? respond() : new HttpResponse(null, { status: 500 });
		})
	);
	return sent;
}

function bodyOf(sent: Sent[], index = 0): Record<string, unknown> {
	const request = sent[index];
	if (!request) {
		throw new Error(`No request ${index} was sent.`);
	}
	return request.body;
}

const accepted =
	(extra: Record<string, unknown> = {}) =>
	() =>
		HttpResponse.json(
			{ status: "accepted", submission_id: "id-from-server", ...extra },
			{ status: 202 }
		);

function pipeStdin(text: string): void {
	vi.spyOn(process, "stdin", "get").mockReturnValue(
		Object.assign(Readable.from([Buffer.from(text)]), {
			isTTY: false,
		}) as unknown as typeof process.stdin
	);
}

describe("cf feedback", () => {
	runInTempDir();
	setupMsw();
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
		agent.harness = null;
		vi.stubEnv("CI", "true");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-feedback-token");
		vi.stubEnv("CF_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_AUTH_PROFILE", undefined);
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.stubEnv("WRANGLER_API_ENVIRONMENT", undefined);
		vi.stubEnv("CF_SEND_TELEMETRY", "true");
		vi.stubEnv("DO_NOT_TRACK", undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it.each([
		["submission", []],
		["dry run", ["--dry-run"]],
	])("requires authentication before a %s", async (_, flags) => {
		const sent = respondWith(accepted());
		const errors = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);

		await expect(runCf(["feedback", "hi", ...flags])).rejects.toThrow(
			"Authentication is required to submit feedback."
		);
		const stderr = errors.mock.calls.flat().join("\n");
		expect(stderr).toContain("cf auth login");
		expect(stderr).not.toContain("--temporary-account");
		expect(output.stdout()).toBe("");
		expect(sent).toHaveLength(0);
	});

	it("does not create a temporary account to submit feedback", async () => {
		const sent = respondWith(accepted());
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);

		await expect(
			runCf(["feedback", "hi", "--temporary-account"])
		).rejects.toThrow("Run 'cf auth login' first");
		expect(sent).toHaveLength(0);
	});

	it("authenticates with a stored OAuth token", async () => {
		const sent = respondWith(accepted());
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		writeAuthConfigFile({
			oauth_token: "test-feedback-oauth-token",
			expiration_time: "2999-01-01T00:00:00.000Z",
		});

		expect(await runCf(["feedback", "hi"])).toEqual({ exitCode: 0 });
		expect(sent).toHaveLength(1);
		expect(sent[0]?.headers.get("authorization")).toBe(
			"Bearer test-feedback-oauth-token"
		);
	});

	it("suggests logging in when the API rejects the user's credentials", async () => {
		const sent = respondWith(() =>
			HttpResponse.json(
				{
					success: false,
					errors: [{ code: 10000, message: "Authentication error" }],
				},
				{ status: 401 }
			)
		);
		const errors = vi.spyOn(console, "error").mockImplementation(() => {});

		await expect(runCf(["feedback", "hi"])).rejects.toThrow();
		expect(errors.mock.calls.flat().join("\n")).toContain("cf auth login");
		expect(sent).toHaveLength(1);
	});

	it("posts a note with CLI context and prints the server's reply", async () => {
		const sent = respondWith(accepted());

		expect(await runCf(["feedback", "deploy output is confusing"])).toEqual({
			exitCode: 0,
		});

		expect(sent).toHaveLength(1);
		const [first] = sent;
		if (!first) {
			throw new Error("No request was sent.");
		}
		const { body, headers } = first;
		expect(body).toMatchObject({
			schema_version: 1,
			message: "deploy output is confusing",
			submission_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
			sent_at: expect.any(String),
			client: {
				cli_version: expect.any(String),
				os: expect.any(String),
				node_major: expect.any(Number),
			},
		});
		expect(headers.get("user-agent")).toMatch(/^cf-cli\//);
		expect(headers.get("authorization")).toBe("Bearer test-feedback-token");
		expect(JSON.parse(output.stdout())).toEqual({
			status: "accepted",
			submission_id: "id-from-server",
		});
	});

	it("prints a receipt wrapped in the Cloudflare API response envelope", async () => {
		const receipt = { status: "accepted", submission_id: "id-from-server" };
		respondWith(() =>
			HttpResponse.json({ success: true, result: receipt }, { status: 202 })
		);
		await runCf(["feedback", "hi"]);
		expect(JSON.parse(output.stdout())).toEqual(receipt);
	});

	it.each([
		["telemetry is off", { CF_SEND_TELEMETRY: "false" }],
		["DO_NOT_TRACK is on", { DO_NOT_TRACK: "1" }],
	])("attaches diagnostic context when %s", async (_, env) => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi"], env);
		expect(bodyOf(sent).client).toMatchObject({
			cli_version: expect.any(String),
		});
	});

	it.each(["--context", "--no-context"])(
		"rejects the removed %s flag",
		async (flag) => {
			await expect(runCf(["feedback", "hi", flag])).rejects.toThrow(
				/Unknown argument/i
			);
		}
	);

	it("reports the detected agent harness but not its session ID", async () => {
		agent.harness = { id: "claude-code", name: "Claude Code" };
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi"]);
		expect(bodyOf(sent).client).toMatchObject({
			agent_detected: "claude-code",
		});
		expect(JSON.stringify(bodyOf(sent))).not.toContain("session-secret");
	});

	it("sends --field values, routing known keys", async () => {
		const sent = respondWith(accepted());
		await runCf([
			"feedback",
			"hi",
			"--field",
			"type=bug",
			"--field",
			"area=docs",
		]);
		expect(bodyOf(sent)).toMatchObject({
			type: "bug",
			fields: { area: "docs" },
		});
	});

	it("reads an agent report from a file", async () => {
		writeFileSync(
			"report.json",
			JSON.stringify({
				task: "Deploy the Worker",
				agent: {
					name: "codex",
					errors: [{ message: "Authentication error", code: 10000 }],
				},
			})
		);
		const sent = respondWith(accepted());
		await runCf(["feedback", "--input-json", "report.json"]);
		expect(bodyOf(sent)).toMatchObject({
			task: "Deploy the Worker",
			agent: {
				name: "codex",
				errors: [{ message: "Authentication error", code: 10000 }],
			},
		});
	});

	it("reads an agent report from stdin", async () => {
		pipeStdin(JSON.stringify({ expected: "it works", actual: "it does not" }));
		const sent = respondWith(accepted());
		await runCf(["feedback", "--input-json", "-"]);
		expect(bodyOf(sent)).toMatchObject({
			expected: "it works",
			actual: "it does not",
		});
	});

	it("reads the note from stdin with -", async () => {
		pipeStdin("a note from a pipe\n");
		const sent = respondWith(accepted());
		await runCf(["feedback", "-"]);
		expect(bodyOf(sent).message).toBe("a note from a pipe");
	});

	it("refuses to read both the note and the report from stdin", async () => {
		await expect(runCf(["feedback", "-", "--input-json=-"])).rejects.toThrow(
			"Only one of the note and --input-json can read from stdin."
		);
	});

	it("rejects invalid JSON in the report", async () => {
		writeFileSync("report.json", "{not json");
		await expect(
			runCf(["feedback", "--input-json", "report.json"])
		).rejects.toThrow("--input-json is not valid JSON");
	});

	it("explains what to send when nothing was given", async () => {
		await expect(runCf(["feedback"])).rejects.toThrow(
			"Provide a note, a --field such as expected=…, or --input-json."
		);
	});

	it("prints the payload for --dry-run without sending it", async () => {
		expect(await runCf(["feedback", "hi", "--dry-run"])).toEqual({
			exitCode: 0,
		});
		const printed = JSON.parse(output.stdout());
		expect(printed).toMatchObject({
			dryRun: true,
			url: FEEDBACK_URL,
			payload: { schema_version: 1, message: "hi" },
		});
	});

	it("accepts a complete report of exactly 16 KiB", async () => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "x", "--dry-run"]);
		const { payload } = JSON.parse(output.stdout());
		const overhead = Buffer.byteLength(JSON.stringify(payload)) - 1;

		const note = "x".repeat(16 * 1024 - overhead);
		expect(await runCf(["feedback", note])).toEqual({ exitCode: 0 });
		expect(Buffer.byteLength(JSON.stringify(bodyOf(sent)))).toBe(16 * 1024);
	});

	it.each([
		["submission", []],
		["dry run", ["--dry-run"]],
	])("rejects a %s that exceeds the limit in UTF-8 bytes", async (_, flags) => {
		const sent = respondWith(accepted());
		const note = "é".repeat(8 * 1024);

		await expect(runCf(["feedback", note, ...flags])).rejects.toThrow(
			"Feedback is larger than 16 KiB. Shorten the note or the report."
		);
		expect(output.stdout()).toBe("");
		expect(sent).toHaveLength(0);
	});

	it("follows CLOUDFLARE_API_BASE_URL like other API calls", async () => {
		const routed = `${TEST_BASE_URL}/feedback/send`;
		let authorization: string | null = null;
		server.use(
			http.post(routed, ({ request }) => {
				authorization = request.headers.get("authorization");
				return accepted()();
			})
		);
		await runCf(["feedback", "hi"], { CLOUDFLARE_API_BASE_URL: TEST_BASE_URL });
		expect(authorization).toBe("Bearer test-feedback-token");
	});

	it("sends to the FedRAMP API in the FedRAMP compliance region", async () => {
		await runCf(["feedback", "hi", "--dry-run"], {
			CLOUDFLARE_COMPLIANCE_REGION: "fedramp_high",
		});
		expect(JSON.parse(output.stdout())).toMatchObject({
			url: "https://api.fed.cloudflare.com/client/v4/feedback/send",
		});
	});

	it("does not send authentication to a legacy feedback URL override", async () => {
		const local = "http://localhost:5173/v1/feedback";
		const sent = respondWith(accepted());
		const overridden = vi.fn(() => accepted()());
		server.use(http.post(local, overridden));
		await runCf(["feedback", "hi"], { CF_FEEDBACK_URL: local });
		expect(overridden).not.toHaveBeenCalled();
		expect(sent[0]?.headers.get("authorization")).toBe(
			"Bearer test-feedback-token"
		);
	});

	it("warns about ignored fields and redacted credentials", async () => {
		respondWith(
			accepted({
				notices: ["credential_redacted"],
				ignored: [{ path: "type", reason: "moved" }],
			})
		);
		await runCf(["feedback", "hi"]);
		const err = output.stderr();
		expect(err).toContain("A credential was removed from your feedback");
		expect(err).toContain("type (moved)");
	});

	it("rejects a malformed receipt", async () => {
		respondWith(accepted({ ignored: [null] }));
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			"The feedback service returned an unexpected response."
		);
		expect(output.stdout()).toBe("");
	});

	it("retries 503 with the same submission ID", async () => {
		const sent = respondWith(
			() =>
				new HttpResponse(null, {
					status: 503,
					headers: { "Retry-After": "1" },
				}),
			accepted()
		);
		expect(await runCf(["feedback", "hi"])).toEqual({ exitCode: 0 });
		expect(sent).toHaveLength(2);
		expect(bodyOf(sent, 1).submission_id).toBe(bodyOf(sent).submission_id);
		expect(sent[1]?.headers.get("authorization")).toBe(
			"Bearer test-feedback-token"
		);
	});

	it("reports an unconfirmed submission when the connection fails", async () => {
		const sent = respondWith(() => HttpResponse.error());
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			"Unable to confirm that feedback was received."
		);
		expect(sent).toHaveLength(1);
	});

	it("does not retry a rejected submission and shows why", async () => {
		const sent = respondWith(() =>
			HttpResponse.json(
				{ error: "invalid", issues: [{ path: "submission_id", type: "uuid" }] },
				{ status: 422 }
			)
		);
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			"The feedback service rejected the submission (invalid: submission_id)."
		);
		expect(sent).toHaveLength(1);
	});

	it("tells the user to upgrade when the service refuses this CLI version", async () => {
		const sent = respondWith(() =>
			HttpResponse.json(
				{
					error: "cli_version_unsupported",
					reason: "below_minimum",
					minimum_version: "9.9.9",
				},
				{ status: 403 }
			)
		);
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			/can no longer send feedback\. Upgrade cf to 9\.9\.9 or later/
		);
		expect(sent).toHaveLength(1);
	});

	it("tells the user to upgrade when this exact version is blocked", async () => {
		respondWith(() =>
			HttpResponse.json(
				{ error: "cli_version_unsupported", reason: "blocked" },
				{ status: 403 }
			)
		);
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			/can no longer send feedback\. Upgrade cf and try again\./
		);
	});

	it("documents authentication, the fields and an agent example in --help", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		const { cli } = buildCli(["feedback", "--help"]);
		const help = await cli.getHelp();
		expect(help).toContain("Sign in with cf auth login");
		expect(help.replace(/\s+/g, " ")).toContain(
			"Feedback reports include the CLI version, OS, and detected agent and model for diagnostics."
		);
		for (const field of [
			"type",
			"product",
			"task",
			"expected",
			"actual",
			"impact",
			"suggestion",
			"rating",
			"model",
		]) {
			expect(help).toContain(field);
		}
		expect(help).toContain("16 KiB");
		expect(help).toContain("--input-json -");
		expect(help).toContain("Do not include secrets");
		expect(help.replace(/\s+/g, " ")).toContain(
			"tell the user at the next natural break, such as the end of the current turn, and include the submission ID"
		);
		expect(help).not.toContain("DO_NOT_TRACK is enabled");
	});

	it("warns in --help that feedback includes diagnostics under DO_NOT_TRACK", async () => {
		vi.stubEnv("DO_NOT_TRACK", "1");
		const { cli } = buildCli(["feedback", "--help"]);
		const help = (await cli.getHelp()).replace(/\s+/g, " ");
		expect(help).toContain("DO_NOT_TRACK is enabled");
		expect(help).toContain(
			"cf version, execution mode, and detected agent harness"
		);
		expect(help).toContain(
			"Sending feedback includes diagnostic context in the report."
		);
	});
});
