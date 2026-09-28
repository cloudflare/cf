import {
	configureOpenAPIForContainerPull,
	DeploymentsService,
	initContainersSharedContext,
	sshCommand,
} from "@cloudflare/containers-shared";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateResourceIndexFile } from "../../../generator/emit/index-files.js";
import {
	handWrittenLeafCommands,
	readHandWrittenLeafCommandMeta,
} from "../../../generator/hand-written-overrides.js";
import { openSession } from "../../lib/session.js";
import { readState, updateState } from "../../lib/state.js";
import { USER_AGENT } from "../../version.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import type * as ContainersShared from "@cloudflare/containers-shared";

vi.mock("../../lib/session.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	openSession: vi.fn(),
}));

vi.mock("../../lib/state.js", () => ({
	readState: vi.fn(() => ({})),
	updateState: vi.fn(),
}));

vi.mock("../../lib/agent-context.js", () => ({
	detectAgentContext: () => ({
		isAgentic: true,
		harness: { id: "codex", name: "OpenAI Codex" },
		model: null,
		sessionId: null,
		invocationId: null,
		matches: [],
	}),
}));

vi.mock("@cloudflare/containers-shared", async (importOriginal) => {
	const original = await importOriginal<typeof ContainersShared>();
	return {
		...original,
		configureOpenAPIForContainerPull: vi.fn(
			original.configureOpenAPIForContainerPull
		),
		initContainersSharedContext: vi.fn(),
		sshCommand: vi.fn(),
	};
});

describe("cf containers ssh", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();
	const streams = [process.stdin, process.stdout, process.stderr];
	const originalTTY = streams.map((stream) => stream.isTTY);
	beforeEach(() => {
		vi.clearAllMocks();
		for (const stream of streams) {
			stream.isTTY = true;
		}
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account-id");
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(sshCommand).mockResolvedValue(undefined);
	});
	afterEach(() => {
		streams.forEach((stream, i) => {
			Object.defineProperty(stream, "isTTY", {
				value: originalTTY[i],
				writable: true,
				configurable: true,
			});
		});
	});
	it("sends cf headers and bearer authorization through the shared SSH client", async () => {
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);
		const authorize = vi.fn(({ request }: { request: Request }) => {
			expect(request.headers.get("user-agent")).toBe(USER_AGENT);
			expect(request.headers.get("x-cf-cli-mode")).toMatch(
				/^(interactive|non-interactive|ci)$/
			);
			expect(request.headers.get("x-cf-cli-agent")).toBe("codex");
			expect(request.headers.get("authorization")).toBe(
				"Bearer test-api-token"
			);
			return HttpResponse.json({ success: true, result: {} });
		});
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/test-account-id/containers/instances/instance-id/ssh`,
				authorize
			)
		);
		vi.mocked(sshCommand).mockImplementationOnce(async ({ id }) => {
			await DeploymentsService.containerWranglerSsh(id);
		});
		await runCf(["containers", "ssh", "instance-id"]);
		expect(authorize).toHaveBeenCalledOnce();
	});
	it.each([
		{ flags: ["--stdio"], piped: false },
		{ flags: ["--stdio=true"], piped: false },
		{ flags: [], piped: true },
	])(
		"suppresses startup output in proxy mode: %j",
		async ({ flags, piped }) => {
			process.stdin.isTTY = !piped;
			process.stdout.isTTY = !piped;
			await runCf(["containers", "ssh", "instance-id", ...flags]);
			expect(openSession).toHaveBeenCalledWith(expect.any(String), {
				quiet: true,
			});
			expect(readState).not.toHaveBeenCalled();
			expect(updateState).not.toHaveBeenCalled();
		}
	);
	it.each(["--stdio=false", "--no-stdio"])(
		"keeps startup output for %s with a terminal",
		async (flag) => {
			await runCf(["containers", "ssh", "instance-id", flag]);
			expect(openSession).toHaveBeenCalledWith(expect.any(String), {
				quiet: false,
			});
			await vi.waitFor(() =>
				expect(updateState).toHaveBeenCalledWith({
					completions: { prompted: true },
				})
			);
		}
	);
	it("keeps startup output for other commands with piped stdin and stdout", async () => {
		process.stdin.isTTY = false;
		process.stdout.isTTY = false;
		await runCf(["schema", "zones", "list"]);
		expect(openSession).toHaveBeenCalledWith(expect.any(String), {
			quiet: false,
		});
		await vi.waitFor(() =>
			expect(updateState).toHaveBeenCalledWith({
				completions: { prompted: true },
			})
		);
	});
	it("uses shared SSH with cf credentials and compliance routing", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");
		expect(await runCf(["containers", "ssh", "instance-id"])).toEqual({
			exitCode: 0,
		});
		expect(configureOpenAPIForContainerPull).toHaveBeenCalledWith(
			"test-account-id",
			"test-api-token",
			"https://api.fed.cloudflare.com/client/v4"
		);
		expect(initContainersSharedContext).toHaveBeenCalledOnce();
		expect(sshCommand).toHaveBeenCalledWith(
			expect.objectContaining({ id: "instance-id", command: [] })
		);
	});
	it("forwards stdio mode and arguments after -- literally", async () => {
		await runCf([
			"containers",
			"ssh",
			"instance-id",
			"--stdio",
			"--",
			"printf",
			"%s",
			"001",
			"--help",
			"--version",
		]);
		expect(sshCommand).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "instance-id",
				stdio: true,
				command: ["printf", "%s", "001", "--help", "--version"],
			})
		);
	});
	it.each(["--version", "-v", "--quiet", "--stdio"])(
		"opens the cf session when %s belongs to the remote command",
		async (flag) => {
			await runCf(["containers", "ssh", "instance-id", "--", "printf", flag]);
			expect(openSession).toHaveBeenCalledWith(expect.any(String), {
				quiet: false,
			});
			expect(sshCommand).toHaveBeenCalledWith(
				expect.objectContaining({ command: ["printf", flag] })
			);
			await vi.waitFor(() =>
				expect(updateState).toHaveBeenCalledWith({
					completions: { prompted: true },
				})
			);
		}
	);
	it("accepts remote command positionals and legacy OpenSSH options", async () => {
		await runCf([
			"containers",
			"ssh",
			"instance-id",
			"-i",
			"/tmp/key",
			"-F",
			"/tmp/config",
			"-o",
			"A=yes",
			"-o",
			"B=no",
			"uname",
			"-a",
		]);
		expect(sshCommand).toHaveBeenCalledWith(
			expect.objectContaining({
				identityFile: "/tmp/key",
				configFile: "/tmp/config",
				option: ["A=yes", "B=no"],
				command: ["uname", "-a"],
			})
		);
	});
	it("rejects local mode before authentication or SSH", async () => {
		await expect(
			runCf(["containers", "ssh", "instance-id", "--local"])
		).rejects.toThrow("--local is not supported");
		expect(configureOpenAPIForContainerPull).not.toHaveBeenCalled();
		expect(sshCommand).not.toHaveBeenCalled();
	});
	it("requires an instance ID", async () => {
		await expect(runCf(["containers", "ssh"])).rejects.toThrow();
		expect(sshCommand).not.toHaveBeenCalled();
	});
	it("shows help without authenticating or exposing deprecated options", async () => {
		await runCf(["containers", "ssh", "--help"]);
		expect(openSession).toHaveBeenCalledWith(expect.any(String), {
			quiet: false,
		});
		expect(std.out).toContain("--stdio");
		expect(std.out).not.toContain("--identity-file");
		expect(configureOpenAPIForContainerPull).not.toHaveBeenCalled();
		expect(sshCommand).not.toHaveBeenCalled();
	});
	it("propagates shared SSH failures", async () => {
		vi.mocked(sshCommand).mockRejectedValue(
			new Error("Instance missing not found")
		);
		await expect(runCf(["containers", "ssh", "missing"])).rejects.toThrow(
			"Instance missing not found"
		);
	});
	it("does not initialize telemetry when stdio mode fails", async () => {
		vi.mocked(sshCommand).mockRejectedValue(
			new Error("Instance missing not found")
		);
		await expect(
			runCf(["containers", "ssh", "missing", "--stdio"])
		).rejects.toThrow("Instance missing not found");
		expect(readState).not.toHaveBeenCalled();
		expect(updateState).not.toHaveBeenCalled();
	});
	it("registers metadata and guards against a future spec collision", () => {
		const entry = handWrittenLeafCommands("containers").find(
			(command) => command.name === "ssh"
		);
		expect(entry).toBeDefined();
		if (!entry) {
			throw new Error("Missing ssh registry entry");
		}
		expect(readHandWrittenLeafCommandMeta("containers", entry)).toMatchObject({
			command: "cf containers ssh",
			fullPath: ["containers", "ssh"],
		});
		const schema = {
			name: "containers",
			description: "Containers",
		} as Parameters<typeof generateResourceIndexFile>[0];
		expect(() => generateResourceIndexFile(schema, ["ssh"], [])).toThrow(
			'Hand-written leaf command "containers ssh" collides'
		);
	});
});
