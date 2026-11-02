import { writeFileSync } from "node:fs";
import { Readable } from "node:stream";
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
import { server, setupMsw } from "../helpers/msw.js";
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

const FEEDBACK_URL =
	"https://cf-cli-feedback-staging.tk.workers.dev/v1/feedback";

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
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CF_FEEDBACK_URL", undefined);
		vi.stubEnv("CF_SEND_TELEMETRY", "true");
		vi.stubEnv("DO_NOT_TRACK", undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
				telemetry_enabled: true,
			},
		});
		expect(headers.get("user-agent")).toMatch(/^cf-cli\//);
		expect(headers.get("authorization")).toBeNull();
		expect(JSON.parse(output.stdout())).toEqual({
			status: "accepted",
			submission_id: "id-from-server",
		});
	});

	it("leaves out CLI context when telemetry is off", async () => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi"], { CF_SEND_TELEMETRY: "false" });
		expect(bodyOf(sent)).not.toHaveProperty("client");
	});

	it("attaches context with --context even when telemetry is off", async () => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi", "--context"], {
			CF_SEND_TELEMETRY: "false",
		});
		expect(bodyOf(sent).client).toMatchObject({ telemetry_enabled: false });
	});

	it("never attaches context under DO_NOT_TRACK", async () => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi", "--context"], { DO_NOT_TRACK: "1" });
		expect(bodyOf(sent)).not.toHaveProperty("client");
	});

	it("never attaches context with --no-context", async () => {
		const sent = respondWith(accepted());
		await runCf(["feedback", "hi", "--no-context"]);
		expect(bodyOf(sent)).not.toHaveProperty("client");
	});

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

	it("posts to CF_FEEDBACK_URL when it is set", async () => {
		const local = "http://localhost:5173/v1/feedback";
		let hit = false;
		server.use(
			http.post(local, () => {
				hit = true;
				return accepted()();
			})
		);
		await runCf(["feedback", "hi"], { CF_FEEDBACK_URL: local });
		expect(hit).toBe(true);
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

	it("retries 503 with the same submission ID", async () => {
		const sent = respondWith(
			() =>
				new HttpResponse(null, {
					status: 503,
					headers: { "Retry-After": "30" },
				}),
			accepted()
		);
		expect(await runCf(["feedback", "hi"])).toEqual({ exitCode: 0 });
		expect(sent).toHaveLength(2);
		expect(bodyOf(sent, 1).submission_id).toBe(bodyOf(sent).submission_id);
	});

	it("gives up after three attempts and says it may have been sent", async () => {
		const sent = respondWith(() => HttpResponse.error());
		await expect(runCf(["feedback", "hi"])).rejects.toThrow(
			"Unable to reach the feedback service"
		);
		expect(sent).toHaveLength(3);
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

	it("documents the fields and an agent example in --help", async () => {
		const { cli } = buildCli(["feedback", "--help"]);
		const help = await cli.getHelp();
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
		expect(help).toContain("--input-json -");
		expect(help).toContain("Do not include secrets");
	});
});
