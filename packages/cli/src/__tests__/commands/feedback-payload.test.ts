import { describe, expect, it } from "vite-plus/test";
import {
	buildClientContext,
	shouldAttachContext,
} from "../../commands/feedback/context.js";
import {
	buildSubmission,
	parseFieldArgs,
} from "../../commands/feedback/payload.js";

const ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const SENT_AT = "2026-10-30T12:00:00.000Z";
const base = { fieldArgs: [], submissionId: ID, sentAt: SENT_AT };

describe("parseFieldArgs", () => {
	it("splits on the first = and keeps the rest of the value", () => {
		expect(parseFieldArgs(["type=bug", "note=a=b"])).toEqual({
			type: "bug",
			note: "a=b",
		});
	});

	it("normalises keys to lower case with underscores", () => {
		expect(parseFieldArgs(["Repro-Steps=x"])).toEqual({ repro_steps: "x" });
	});

	it("keeps the last value for a repeated key and drops blank values", () => {
		expect(parseFieldArgs(["a=1", "a=2", "b=", "c=  "])).toEqual({ a: "2" });
	});

	it.each(["noequals", "=value", " =value"])("rejects %j", (arg) => {
		expect(() => parseFieldArgs([arg])).toThrow("--field must be key=value");
	});
});

describe("buildSubmission", () => {
	it("builds a minimal submission from a note", () => {
		expect(buildSubmission({ ...base, note: "deploy is confusing" })).toEqual({
			submission: {
				schema_version: 1,
				submission_id: ID,
				sent_at: SENT_AT,
				message: "deploy is confusing",
			},
			overridden: [],
		});
	});

	it("routes known field keys to typed slots and the rest to fields", () => {
		const { submission } = buildSubmission({
			...base,
			note: "hi",
			fieldArgs: [
				"type=bug",
				"product=workers",
				"model=claude-opus-5-5",
				"area=docs",
			],
		});
		expect(submission).toMatchObject({
			type: "bug",
			product: "workers",
			agent: { model: "claude-opus-5-5" },
			fields: { area: "docs" },
		});
	});

	it("refuses a message field alongside a note", () => {
		expect(() =>
			buildSubmission({ ...base, note: "hi", fieldArgs: ["message=other"] })
		).toThrow("Pass the message as the note or as --field message, not both.");
	});

	it("uses a message field when there is no note", () => {
		const { submission } = buildSubmission({
			...base,
			fieldArgs: ["message=from field"],
		});
		expect(submission.message).toBe("from field");
	});

	it("merges an agent report, letting --field win and saying so", () => {
		const { submission, overridden } = buildSubmission({
			...base,
			inputJson: {
				message: "agent message",
				type: "friction",
				fields: { area: "deploy" },
				agent: { name: "claude-code", errors: [{ message: "boom" }] },
			},
			fieldArgs: ["type=bug", "area=docs"],
		});
		expect(submission).toMatchObject({
			message: "agent message",
			type: "bug",
			fields: { area: "docs" },
			agent: { name: "claude-code", errors: [{ message: "boom" }] },
		});
		expect(overridden).toEqual(["type", "fields.area"]);
	});

	it("never takes CLI-owned fields from the agent report", () => {
		const { submission } = buildSubmission({
			...base,
			note: "hi",
			inputJson: {
				schema_version: 9,
				submission_id: "attacker",
				sent_at: "1999-01-01T00:00:00Z",
				client: { agent_detected: "spoofed" },
			},
			client: { cli_version: "1.0.0" },
		});
		expect(submission).toMatchObject({
			schema_version: 1,
			submission_id: ID,
			sent_at: SENT_AT,
			client: { cli_version: "1.0.0" },
		});
	});

	it("rejects an agent report that is not an object", () => {
		expect(() => buildSubmission({ ...base, inputJson: ["x"] })).toThrow(
			"--input-json must be a JSON object."
		);
	});

	it.each([
		["nothing", {}],
		["only a type", { fieldArgs: ["type=bug"] }],
		["only context", { client: { cli_version: "1.0.0" } }],
	])("rejects a submission with %s to say", (_, extra) => {
		expect(() => buildSubmission({ ...base, ...extra })).toThrow(
			"Provide a note, a --field such as expected=…, or --input-json."
		);
	});

	it.each([
		["a rating", ["rating=4"]],
		["an expected outcome", ["expected=it works"]],
		["an open field", ["area=docs"]],
	])("accepts %s on its own", (_, fieldArgs) => {
		expect(() => buildSubmission({ ...base, fieldArgs })).not.toThrow();
	});
});

describe("shouldAttachContext", () => {
	const on = { enabled: true, source: "default" } as const;
	const off = { enabled: false, source: "config" } as const;
	const dnt = { enabled: false, source: "do-not-track" } as const;

	it.each([
		["follows telemetry when on", undefined, on, true],
		["follows telemetry when off", undefined, off, false],
		["--context overrides telemetry off", true, off, true],
		["--no-context always wins", false, on, false],
		["DO_NOT_TRACK beats --context", true, dnt, false],
	] as const)("%s", (_, flag, telemetry, expected) => {
		expect(shouldAttachContext(flag, telemetry)).toBe(expected);
	});
});

describe("buildClientContext", () => {
	it("reports the detected harness and model but never session identifiers", () => {
		const client = buildClientContext({
			QWEN_CODE_SESSION_ID: "session-secret",
			QWEN_CODE_AGENT_ID: "invocation-secret",
			QWEN_CODE_MODEL: "qwen3-coder",
		});
		expect(client).toMatchObject({
			agent_detected: "qwen-code",
			agent_model_detected: "qwen3-coder",
			telemetry_enabled: expect.any(Boolean),
			node_major: expect.any(Number),
		});
		expect(JSON.stringify(client)).not.toMatch(
			/session-secret|invocation-secret/
		);
	});

	it("omits agent fields outside an agent harness", () => {
		const client = buildClientContext({});
		expect(client).not.toHaveProperty("agent_detected");
		expect(client).not.toHaveProperty("agent_model_detected");
	});

	it("uses the short OS release, which the server accepts", () => {
		expect(buildClientContext({}).os_release).toMatch(/^[A-Za-z0-9 ._:/+-]*$/);
	});
});
