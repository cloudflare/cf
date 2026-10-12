import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";

describe("telemetry dispatcher", () => {
	runInTempDir();

	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("CF_SEND_TELEMETRY", "true");
		vi.stubEnv("SPARROW_SOURCE_KEY", "test-key");
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response()));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("posts product-tagged events without user content", async () => {
		const { getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		const { allTelemetryDispatchesSettled } =
			await import("../../../lib/telemetry/lifecycle.js");
		getTelemetryDispatcher().sendAdhocEvent("test event", { test: true });
		await allTelemetryDispatchesSettled();

		expect(fetch).toHaveBeenCalledOnce();
		const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://sparrow.cloudflare.com/api/v1/event");
		expect(init.headers).toMatchObject({
			"Sparrow-Source-Key": "test-key",
		});
		const body = JSON.parse(init.body as string);
		expect(body.event).toBe("test event");
		expect(body.properties).toMatchObject({
			product: "cf",
			test: true,
			isFirstUsage: true,
		});
		expect(body.deviceId).toEqual(expect.any(String));
	});

	it("records the detected agent on command events", async () => {
		vi.stubEnv("CODEX_THREAD_ID", "private-thread-id");
		const { getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		const { allTelemetryDispatchesSettled } =
			await import("../../../lib/telemetry/lifecycle.js");
		getTelemetryDispatcher().sendCommandEvent("cf command started", {
			command: "zones list",
			sanitizedArgs: {},
			argsUsed: [],
			argsCombination: "",
		});
		await allTelemetryDispatchesSettled();

		const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(body.properties).toMatchObject({
			command: "zones list",
			agent: "codex",
		});
		expect(JSON.stringify(body)).not.toContain("private-thread-id");
	});

	it("joins search, help, and command events in one agent session", async () => {
		vi.stubEnv("CODEX_THREAD_ID", "private-thread-id");
		const { __resetTelemetryForTests, getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		const { allTelemetryDispatchesSettled } =
			await import("../../../lib/telemetry/lifecycle.js");
		const send = async (command: string) => {
			getTelemetryDispatcher().sendCommandEvent("cf command started", {
				command,
				sanitizedArgs: {},
				argsUsed: [],
				argsCombination: "",
			});
			await allTelemetryDispatchesSettled();
			const [, init] = vi.mocked(fetch).mock.calls.at(-1) as [
				string,
				RequestInit,
			];
			return JSON.parse(init.body as string).properties as Record<
				string,
				unknown
			>;
		};

		const search = await send("cli search");
		__resetTelemetryForTests();
		getTelemetryDispatcher().sendAdhocEvent("cf help shown", {
			command: "zones",
		});
		await allTelemetryDispatchesSettled();
		const [, helpInit] = vi.mocked(fetch).mock.calls.at(-1) as [
			string,
			RequestInit,
		];
		const help = JSON.parse(helpInit.body as string).properties as Record<
			string,
			unknown
		>;
		__resetTelemetryForTests();
		const command = await send("zones list");
		expect(search.agentSessionKey).toMatch(/^[a-f0-9]{32}$/);
		expect(help.agentSessionKey).toBe(search.agentSessionKey);
		expect(command.agentSessionKey).toBe(search.agentSessionKey);
		expect(JSON.stringify({ search, help, command })).not.toContain(
			"private-thread-id"
		);

		vi.stubEnv("CODEX_THREAD_ID", "another-thread-id");
		__resetTelemetryForTests();
		const other = await send("zones list");
		expect(other.agentSessionKey).not.toBe(search.agentSessionKey);
	});

	it("does not dispatch under DO_NOT_TRACK, even with an explicit opt-in", async () => {
		vi.stubEnv("DO_NOT_TRACK", "1");
		const { getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		getTelemetryDispatcher().sendAdhocEvent("test event");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("does not dispatch under the Wrangler environment alias", async () => {
		vi.stubEnv("CF_SEND_TELEMETRY", undefined);
		vi.stubEnv("WRANGLER_SEND_METRICS", "false");
		const { getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		getTelemetryDispatcher().sendAdhocEvent("test event");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("does not dispatch when disabled", async () => {
		vi.stubEnv("CF_SEND_TELEMETRY", "false");
		const { getTelemetryDispatcher } =
			await import("../../../lib/telemetry/dispatcher.js");
		const { allTelemetryDispatchesSettled } =
			await import("../../../lib/telemetry/lifecycle.js");
		getTelemetryDispatcher().sendAdhocEvent("test event");
		await allTelemetryDispatchesSettled();
		expect(fetch).not.toHaveBeenCalled();
	});
});
