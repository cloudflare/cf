import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { __resetCommandVocabularyForTests } from "../lib/telemetry/command-resolution.js";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";
import type * as InteractiveModule from "../lib/interactive.js";
import type * as MetadataModule from "../lib/metadata.js";
import type * as TelemetryModule from "../lib/telemetry/index.js";
import type { TelemetryDispatcher } from "../lib/telemetry/index.js";

const {
	actualLoadMeta,
	dispatcher,
	getTelemetryDispatcher,
	loadMeta,
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
		actualLoadMeta: {
			current: undefined as typeof MetadataModule.loadMeta | undefined,
		},
		dispatcher: mockedDispatcher,
		getTelemetryDispatcher: vi.fn<() => TelemetryDispatcher>(
			() => mockedDispatcher
		),
		loadMeta: vi.fn<typeof MetadataModule.loadMeta>(),
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

vi.mock("../lib/metadata.js", async (importOriginal) => {
	const actual = await importOriginal<typeof MetadataModule>();
	actualLoadMeta.current = actual.loadMeta;
	loadMeta.mockImplementation(actual.loadMeta);
	return { ...actual, loadMeta };
});

vi.mock("../lib/state.js", () => ({
	readState: () => ({}),
	updateState,
}));

vi.mock("../lib/interactive.js", async (importOriginal) => ({
	...(await importOriginal<typeof InteractiveModule>()),
	isCI: false,
}));

vi.mock("../lib/update-check.js", () => ({
	getUpdateNotice: vi.fn(),
	maybeStartBackgroundUpdateCheck: vi.fn(),
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
		__resetCommandVocabularyForTests();
		if (actualLoadMeta.current) {
			loadMeta.mockImplementation(actualLoadMeta.current);
		}
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

		const resolution = {
			command: "unknown command",
			resolutionFailure: "unknown-subcommand",
			knownCommand: "",
			knownCommandIsLeaf: false,
			unknownTokens: ["<word>"],
			unknownTokenCount: 1,
			unknownFlagCount: 0,
			argsUsed: [],
		};
		expect(sendCommandEvent).toHaveBeenCalledTimes(2);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			1,
			"cf command started",
			expect.objectContaining(resolution)
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ ...resolution, outcome: "error" })
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
			expect.objectContaining({
				command: "unknown command",
				unknownTokens: ["<word>"],
				argsUsed: ["zone"],
			})
		);
		expect(sendCommandEvent).toHaveBeenNthCalledWith(
			2,
			"cf command finished",
			expect.objectContaining({ command: "unknown command", outcome: "error" })
		);
		expect(JSON.stringify(sendCommandEvent.mock.calls)).not.toContain(
			"telemetry"
		);
	});

	it.each([
		{
			args: ["frobnicate", "foo"],
			error: "Unknown commands: frobnicate, foo",
			command: "unknown command",
			resolution: {
				resolutionFailure: "unknown-subcommand",
				knownCommand: "",
				unknownTokens: ["<word>", "<word>"],
				unknownTokenCount: 2,
			},
		},
		{
			args: ["tunnel", "run"],
			error: "Did you mean tunnels?",
			command: "unknown command",
			resolution: {
				resolutionFailure: "suggested-command",
				knownCommand: "",
				unknownTokens: ["<word>", "<word>"],
				unknownTokenCount: 2,
				suggestedCommand: "tunnels",
			},
		},
		{
			args: ["acount"],
			error: "Did you mean accounts?",
			command: "unknown command",
			resolution: {
				resolutionFailure: "suggested-command",
				knownCommand: "",
				unknownTokens: ["<word>"],
				suggestedCommand: "accounts",
			},
		},
		{
			args: ["--bogus"],
			error: "You need to specify a command",
			command: "unknown command",
			resolution: {
				resolutionFailure: "missing-command",
				knownCommand: "",
				unknownTokens: [],
				unknownTokenCount: 0,
				unknownFlagCount: 1,
				argsUsed: [],
			},
		},
		{
			args: ["-x"],
			error: "You need to specify a command",
			command: "unknown command",
			resolution: {
				resolutionFailure: "missing-command",
				unknownFlagCount: 1,
				argsUsed: [],
			},
		},
		{
			args: ["workers", "deploy"],
			error: "Unknown command: deploy",
			command: "unknown command",
			resolution: {
				resolutionFailure: "unknown-subcommand",
				knownCommand: "workers",
				knownCommandIsLeaf: false,
				unknownTokens: ["deploy"],
			},
		},
		{
			args: ["r2", "buckets", "lsit"],
			error: "Did you mean list?",
			command: "r2 buckets",
			resolution: {
				resolutionFailure: "suggested-command",
				knownCommand: "r2 buckets",
				unknownTokens: ["<word>"],
				suggestedCommand: "list",
			},
		},
		{
			args: ["zones", "get", "023e105f4ecef8ad9ca31a8372d0c353"],
			error: "Unknown command: 023e105f4ecef8ad9ca31a8372d0c353",
			command: "unknown command",
			resolution: {
				resolutionFailure: "surplus-positional",
				knownCommand: "zones get",
				knownCommandIsLeaf: true,
				unknownTokens: ["<hex>"],
			},
		},
		{
			args: ["dns", "records", "list", "example.com"],
			error: "Unknown command: example.com",
			command: "unknown command",
			resolution: {
				resolutionFailure: "surplus-positional",
				knownCommand: "dns records list",
				unknownTokens: ["<domain>"],
			},
		},
		{
			args: ["zones", "list", "./a/b"],
			error: "Unknown command: ./a/b",
			command: "unknown command",
			resolution: { unknownTokens: ["<path>"] },
		},
		{
			args: ["zones", "list", "C:\\x"],
			error: "Unknown command: C:\\x",
			command: "unknown command",
			resolution: { unknownTokens: ["<path>"] },
		},
		{
			// The plural message keeps the resolved command's name, as it did
			// before resolution detail was recorded.
			args: ["zones", "get", "abc", "extra"],
			error: "Unknown commands: abc, extra",
			command: "zones get",
			resolution: {
				resolutionFailure: "surplus-positional",
				knownCommand: "zones get",
				unknownTokenCount: 2,
			},
		},
		{
			args: ["workers", "deploy", "my-worker"],
			error: "Unknown commands: deploy, my-worker",
			command: "workers",
			resolution: {
				resolutionFailure: "unknown-subcommand",
				knownCommand: "workers",
				knownCommandIsLeaf: false,
				unknownTokens: ["deploy", "<word>"],
				unknownTokenCount: 2,
			},
		},
		{
			// Only the first unresolved token can be a command word; `dev` may
			// be a value for the intended command.
			args: ["workers", "deploy", "dev"],
			error: "Unknown commands: deploy, dev",
			command: "workers",
			resolution: {
				resolutionFailure: "unknown-subcommand",
				knownCommand: "workers",
				unknownTokens: ["deploy", "<word>"],
				unknownTokenCount: 2,
			},
		},
		{
			args: ["abuse-reports", "get", "RPT123", "test"],
			error: "Unknown command: test",
			command: "unknown command",
			resolution: {
				resolutionFailure: "surplus-positional",
				knownCommand: "abuse-reports get",
				unknownTokens: ["<word>"],
			},
		},
		{
			args: ["zones", "list", "user@example.com"],
			error: "Unknown command: user@example.com",
			command: "unknown command",
			resolution: { unknownTokens: ["<email>"] },
		},
		{
			args: ["zones", "list", "123e4567-e89b-12d3-a456-426614174000"],
			error: "Unknown command: 123e4567-e89b-12d3-a456-426614174000",
			command: "unknown command",
			resolution: { unknownTokens: ["<uuid>"] },
		},
		{
			args: ["zones list"],
			error: "Unknown command: zones list",
			command: "unknown command",
			resolution: { unknownTokens: ["<spaced>"] },
		},
		{
			args: ["kv:namespace"],
			error: "Unknown command: kv:namespace",
			command: "unknown command",
			resolution: { unknownTokens: ["kv:namespace"] },
		},
		{
			args: ["kv:frobnicate"],
			error: "Unknown command: kv:frobnicate",
			command: "unknown command",
			resolution: { unknownTokens: ["<colon>"] },
		},
	])(
		"reports resolution detail for $args",
		async ({ args, error, command, resolution }) => {
			await expect(runCf(args)).rejects.toThrow(error);
			expect(sendCommandEvent).toHaveBeenCalledTimes(2);
			for (const eventName of ["cf command started", "cf command finished"]) {
				expect(sendCommandEvent).toHaveBeenCalledWith(
					eventName,
					expect.objectContaining({
						command,
						sanitizedArgs: {},
						...resolution,
					})
				);
			}
		}
	);

	it("never sends an unrecognised resource name", async () => {
		await expect(runCf(["zones", "list", "my-worker"])).rejects.toThrow(
			"Unknown command: my-worker"
		);
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command finished",
			expect.objectContaining({ unknownTokens: ["<word>"] })
		);
		expect(JSON.stringify(sendCommandEvent.mock.calls)).not.toContain(
			"my-worker"
		);
	});

	it("caps unknown tokens and ignores tokens after --", async () => {
		await expect(
			runCf(["zones", "list", "t1", "t2", "t3", "t4", "t5", "--", "secret"])
		).rejects.toThrow("Unknown commands: t1, t2, t3, t4, t5");
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command finished",
			expect.objectContaining({
				unknownTokens: ["<word>", "<word>", "<word>"],
				unknownTokenCount: 5,
			})
		);
		expect(JSON.stringify(sendCommandEvent.mock.calls)).not.toContain("secret");
	});

	it("names cf flags but only counts unknown ones", async () => {
		await expect(
			runCf([
				"zones",
				"list",
				"extra",
				"--zone-id",
				"abc123",
				"--sk_live_value",
			])
		).rejects.toThrow("Unknown command: extra");
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command finished",
			expect.objectContaining({
				argsUsed: ["zone-id"],
				argsCombination: "zone-id",
				unknownFlagCount: 1,
				sanitizedArgs: {},
			})
		);
		const sent = JSON.stringify(sendCommandEvent.mock.calls);
		expect(sent).not.toContain("abc123");
		expect(sent).not.toContain("sk_live");
	});

	it("names a command-specific short flag", async () => {
		await expect(
			runCf(["smart-shield", "health-checks", "delete", "abc", "extra", "-f"])
		).rejects.toThrow("Unknown command: extra");
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command finished",
			expect.objectContaining({
				resolutionFailure: "surplus-positional",
				knownCommand: "smart-shield health-checks delete",
				argsUsed: ["force"],
				unknownFlagCount: 0,
			})
		);
	});

	it("sends only shape labels when the catalogue cannot load", async () => {
		loadMeta.mockImplementation(() => null);

		await expect(runCf(["workers", "deploy"])).rejects.toThrow(
			"Unknown command: deploy"
		);
		expect(sendCommandEvent).toHaveBeenCalledWith(
			"cf command finished",
			expect.objectContaining({
				command: "unknown command",
				knownCommand: "workers",
				unknownTokens: ["<word>"],
			})
		);
	});

	it("does not load the catalogue when telemetry is disabled", async () => {
		getTelemetryDispatcher.mockReturnValue({ ...dispatcher, enabled: false });
		loadMeta.mockClear();

		await expect(runCf(["workers", "deploy"])).rejects.toThrow(
			"Unknown command: deploy"
		);
		expect(loadMeta).not.toHaveBeenCalledWith(
			expect.anything(),
			"commands.json",
			expect.anything()
		);
		expect(sendCommandEvent).not.toHaveBeenCalled();
	});

	it.each([
		{ args: ["cli", "telemetry", "typo"], error: "Unknown command: typo" },
		{ args: ["clii", "telemetry", "disable"], error: "Did you mean cli?" },
		{
			args: ["cli", "telemtry", "disable"],
			error: "Did you mean telemetry?",
		},
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

	it("shows the first-run notices as info lines naming every shell", async () => {
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});

		await runCf(["unrecognizable"]).catch(() => {});

		expect(output.stderr()).toContain(
			"●  Cloudflare collects anonymous cf usage telemetry. Run cf cli telemetry disable to opt out.\n"
		);
		expect(output.stderr()).toContain(
			"●  Tip: run cf complete <bash|zsh|fish|powershell> to install shell completions.\n"
		);
	});

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
			expect(sendCommandEvent.mock.calls[1]?.[1]).not.toHaveProperty(
				"resolutionFailure"
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
