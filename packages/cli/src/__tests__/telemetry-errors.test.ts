import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";
import type * as TelemetryModule from "../lib/telemetry/index.js";
import type { TelemetryDispatcher } from "../lib/telemetry/index.js";

const {
	dispatcher,
	getTelemetryDispatcher,
	sendAdhocEvent,
	sendCommandEvent,
	updateState,
} = vi.hoisted(() => {
	const mockedSendCommandEvent =
		vi.fn<TelemetryDispatcher["sendCommandEvent"]>();
	const mockedSendAdhocEvent = vi.fn<TelemetryDispatcher["sendAdhocEvent"]>();
	const mockedDispatcher = {
		enabled: true,
		sendCommandEvent: mockedSendCommandEvent,
		sendAdhocEvent: mockedSendAdhocEvent,
	} satisfies TelemetryDispatcher;
	return {
		dispatcher: mockedDispatcher,
		getTelemetryDispatcher: vi.fn<() => TelemetryDispatcher>(
			() => mockedDispatcher
		),
		sendAdhocEvent: mockedSendAdhocEvent,
		sendCommandEvent: mockedSendCommandEvent,
		updateState: vi.fn(),
	};
});

vi.mock("../lib/telemetry/index.js", async (importOriginal) => ({
	...(await importOriginal<typeof TelemetryModule>()),
	getTelemetryDispatcher,
}));

vi.mock("../lib/telemetry/dispatcher.js", () => ({ getTelemetryDispatcher }));

vi.mock("../lib/state.js", () => ({
	readState: () => ({}),
	updateState,
}));

describe("telemetry error reporting", () => {
	const streams = [process.stdin, process.stdout, process.stderr];
	const originalTTY = streams.map((stream) => stream.isTTY);
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
		vi.spyOn(console, "error").mockImplementation(() => {});
		getTelemetryDispatcher.mockReset();
		getTelemetryDispatcher.mockReturnValue(dispatcher);
		sendCommandEvent.mockClear();
		sendAdhocEvent.mockClear();
		updateState.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		streams.forEach((stream, index) => {
			Object.defineProperty(stream, "isTTY", {
				value: originalTTY[index],
				writable: true,
				configurable: true,
			});
		});
	});

	it("reports command-resolution errors as unknown commands", async () => {
		await expect(runCf(["unrecognizable"])).rejects.toThrow(
			"Unknown command: unrecognizable"
		);

		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining({ command: "unknown command" })
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command: "unknown command", outcome: "error" })
		);
	});

	it("reports unknown commands after a leading global flag value", async () => {
		await expect(
			runCf(["--zone", "telemetry", "unrecognizable"])
		).rejects.toThrow("Unknown command: unrecognizable");

		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining({ command: "unknown command" })
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command: "unknown command", outcome: "error" })
		);
	});

	it.each([
		{ args: ["cli", "telemetry", "typo"], error: "Unknown command: typo" },
		{
			args: ["cli", "telemetry", "status", "--bogus"],
			error: "Unknown argument: bogus",
		},
	])(
		"does not report telemetry settings errors: $args",
		async ({ args, error }) => {
			await expect(runCf(args)).rejects.toThrow(error);
			expect(sendCommandEvent).not.toHaveBeenCalled();
		}
	);

	it.each([
		{ args: ["cli", "telemetry", "status"] },
		{ args: ["cli", "telemetry", "enable"] },
		{ args: ["cli", "telemetry", "disable"] },
		{ args: ["cli", "telemetry", "status", "--help"] },
	])(
		"does not report a telemetry settings command: $args",
		async ({ args }) => {
			await runCf(args);
			expect(sendCommandEvent).not.toHaveBeenCalled();
			expect(sendAdhocEvent).not.toHaveBeenCalled();
		}
	);

	it("reports an unknown cli command when telemetry is a flag value", async () => {
		await expect(
			runCf(["cli", "--zone", "telemetry", "unrecognizable"])
		).rejects.toThrow("Unknown command: unrecognizable");
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command started",
			expect.objectContaining({ command: "unknown command" })
		);
	});

	it.each([
		{ args: ["cli", "telemetry", "disable"], notice: false },
		{ args: ["cli", "telemetry", "typo"], notice: false },
		{ args: ["unrecognizable"], notice: true },
	])(
		"shows telemetry notice before $args: $notice",
		async ({ args, notice }) => {
			Object.defineProperty(process.stderr, "isTTY", {
				value: true,
				configurable: true,
			});
			await runCf(args).catch(() => {});
			expect(output.stderr().includes("collects anonymous")).toBe(notice);
		}
	);

	it("does not emit an unknown-command event for validation errors", async () => {
		await expect(runCf(["--profile"])).rejects.toThrow(
			"Not enough arguments following: profile"
		);

		expect(sendCommandEvent).not.toHaveBeenCalled();
	});

	it.each([
		{ args: ["zones"], command: "zones" },
		{ args: ["zones", "--help"], command: "zones" },
		{ args: ["r2", "buckets"], command: "r2 buckets" },
		{ args: ["r2", "buckets", "--help"], command: "r2 buckets" },
		{ args: ["auth"], command: "auth" },
	])("reports $command group help", async ({ args, command }) => {
		await runCf(args);
		expect(sendCommandEvent).not.toHaveBeenCalled();
		expect(sendAdhocEvent).toHaveBeenCalledExactlyOnceWith("cf help shown", {
			command,
		});
	});

	it("reports root help", async () => {
		await runCf(["--help"]);
		expect(sendCommandEvent).not.toHaveBeenCalled();
		expect(sendAdhocEvent).toHaveBeenCalledExactlyOnceWith("cf help shown", {
			command: "cf",
		});
	});

	it("reports the leaf help command path", async () => {
		await runCf(["zones", "list", "--help"]);
		expect(sendCommandEvent).not.toHaveBeenCalled();
		expect(sendAdhocEvent).toHaveBeenCalledExactlyOnceWith("cf help shown", {
			command: "zones list",
		});
	});

	it("does not report completion callback help", async () => {
		await runCf(["complete", "--help"]);
		expect(sendCommandEvent).not.toHaveBeenCalled();
		expect(sendAdhocEvent).not.toHaveBeenCalled();
	});

	it.each([
		{
			args: ["r2", "buckets", "get"],
			command: "r2 buckets get",
			error: "Not enough non-option arguments",
		},
		{
			args: ["build", "--local"],
			command: "build",
			error: "--local is not supported by cf build.",
		},
	])(
		"reports pre-handler validation errors from $command",
		async ({ args, command, error }) => {
			await expect(runCf(args)).rejects.toThrow(error);

			expect(sendCommandEvent).toHaveBeenCalledTimes(2);
			expect(sendAdhocEvent).not.toHaveBeenCalled();
			expect(sendCommandEvent).toHaveBeenNthCalledWith(
				1,
				"cf command started",
				expect.objectContaining({
					command,
					sanitizedArgs: {},
				})
			);
			expect(sendCommandEvent).toHaveBeenNthCalledWith(
				2,
				"cf command finished",
				expect.objectContaining({ command, outcome: "error" })
			);
		}
	);

	it("continues parsing when the telemetry notice fails", async () => {
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});
		getTelemetryDispatcher.mockImplementationOnce(() => {
			throw new Error("state directory unavailable");
		});

		await expect(runCf(["unrecognizable"])).rejects.toThrow(
			"Unknown command: unrecognizable"
		);
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
	});

	it("serializes completion persistence before command telemetry", async () => {
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});

		await expect(runCf(["unrecognizable"])).rejects.toThrow(
			"Unknown command: unrecognizable"
		);
		await vi.waitFor(() =>
			expect(updateState).toHaveBeenCalledWith({
				completions: { prompted: true },
			})
		);
		const completionUpdateIndex = updateState.mock.calls.findIndex(
			([update]) => "completions" in update
		);
		const completionUpdateOrder =
			updateState.mock.invocationCallOrder[completionUpdateIndex];
		expect(getTelemetryDispatcher.mock.invocationCallOrder[0]).toBeLessThan(
			completionUpdateOrder ?? Number.POSITIVE_INFINITY
		);
		expect(completionUpdateOrder).toBeLessThan(
			sendCommandEvent.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY
		);
	});

	it("continues parsing when completion hint persistence fails", async () => {
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});
		updateState.mockImplementation((update) => {
			if ("completions" in update) {
				throw new Error("state directory unavailable");
			}
		});

		await expect(runCf(["unrecognizable"])).rejects.toThrow(
			"Unknown command: unrecognizable"
		);
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
	});

	it.each([
		{
			args: ["access", "curl", "https://private.example", "--local"],
			command: "access curl",
		},
		{
			args: ["access", "token", "https://private.example", "--local"],
			command: "access token",
		},
		{
			args: ["tunnels", "ready", "--metrics", "127.0.0.1:20241", "--local"],
			command: "tunnels ready",
		},
		{ args: ["workers", "check", "--local"], command: "workers check" },
		{ args: ["workers", "types", "--local"], command: "workers types" },
		{
			args: ["containers", "build", ".", "--tag", "image:tag", "--local"],
			command: "containers build",
		},
		{
			args: ["containers", "push", "--tag", "image:tag", "--local"],
			command: "containers push",
		},
		{
			args: ["containers", "images", "list", "--local"],
			command: "containers images list",
		},
		{
			args: ["containers", "images", "delete", "private/image:tag", "--local"],
			command: "containers images delete",
		},
		{
			args: ["d1", "migrations", "apply", "not-an-id"],
			command: "d1 migrations apply",
		},
		{
			args: ["d1", "migrations", "create", "test", "--local"],
			command: "d1 migrations create",
		},
		{
			args: ["d1", "migrations", "list", "not-an-id"],
			command: "d1 migrations list",
		},
	])("reports errors from $command", async ({ args, command }) => {
		await expect(runCf(args)).rejects.toThrow();
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining({ command })
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command, outcome: "error" })
		);
	});

	it("reports completion setup without recording shell arguments", async () => {
		await runCf(["complete", "bash"]);
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining({
				command: "complete",
				sanitizedArgs: {},
				argsUsed: [],
			})
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command: "complete", outcome: "success" })
		);
	});

	it("does not report shell completion callbacks", async () => {
		await runCf(["complete", "--", "cf", "zo"]);
		expect(sendCommandEvent).not.toHaveBeenCalled();
	});

	it("reports errors from containers ssh outside stdio proxy mode", async () => {
		process.stdin.isTTY = true;
		process.stdout.isTTY = true;

		await expect(
			runCf(["containers", "ssh", "instance-id", "--local"])
		).rejects.toThrow();
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining({ command: "containers ssh" })
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command: "containers ssh", outcome: "error" })
		);
	});

	it.each([
		{
			args: [
				"containers",
				"build",
				".",
				"-t",
				"private/image:tag",
				"-p",
				"--path-to-docker",
				"/private/docker",
				"--local",
			],
			command: "containers build",
			expectedArgs: {
				tag: "<REDACTED>",
				push: true,
				"path-to-docker": "<REDACTED>",
				local: true,
			},
		},
		{
			args: [
				"containers",
				"push",
				"-t",
				"private/image:tag",
				"--path-to-docker",
				"/private/docker",
				"--local",
			],
			command: "containers push",
			expectedArgs: {
				tag: "<REDACTED>",
				"path-to-docker": "<REDACTED>",
				local: true,
			},
		},
	])(
		"redacts sensitive arguments from $command telemetry",
		async ({ args, command, expectedArgs }) => {
			await expect(runCf(args)).rejects.toThrow();
			expect(sendCommandEvent).toHaveBeenNthCalledWith(
				1,
				"cf command started",
				expect.objectContaining({
					command,
					sanitizedArgs: expectedArgs,
				})
			);
		}
	);

	it("reports CliExit failures from schema", async () => {
		await expect(runCf(["schema"])).resolves.toEqual({ exitCode: 1 });
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenLastCalledWith(
			"cf command finished",
			expect.objectContaining({ command: "schema", outcome: "error" })
		);
	});
});
