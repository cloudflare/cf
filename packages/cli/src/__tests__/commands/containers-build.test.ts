import { writeFileSync } from "node:fs";
import {
	buildCommand,
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
} from "@cloudflare/containers-shared";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateResourceIndexFile } from "../../../generator/emit/index-files.js";
import {
	handWrittenLeafCommands,
	readHandWrittenLeafCommandMeta,
} from "../../../generator/hand-written-overrides.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("@cloudflare/containers-shared", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		buildCommand: vi.fn(),
		configureOpenAPIForContainerPull: vi.fn(),
		initContainersSharedContext: vi.fn(),
	};
});

describe("cf containers build", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account-id");
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(buildCommand).mockResolvedValue(undefined);
	});

	it("builds a tagged image through containers-shared", async () => {
		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"--tag",
			"example/image:tag",
		]);

		expect(exitCode).toBe(0);
		expect(initContainersSharedContext).toHaveBeenCalledOnce();
		expect(configureOpenAPIForContainerPull).not.toHaveBeenCalled();
		expect(buildCommand).toHaveBeenCalledWith(
			{
				PATH: ".",
				tag: "example/image:tag",
				push: false,
				pathToDocker: undefined,
			},
			{ compliance_region: "public" }
		);
	});

	it("builds without Cloudflare credentials when not pushing", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);

		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"--tag",
			"example/image:local",
		]);

		expect(exitCode).toBe(0);
		expect(configureOpenAPIForContainerPull).not.toHaveBeenCalled();
		expect(buildCommand).toHaveBeenCalledOnce();
	});

	it("does not load project settings when not pushing", async () => {
		writeFileSync(
			"cloudflare.config.ts",
			'throw new Error("project config should not be loaded");'
		);

		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"--tag",
			"example/image:local",
		]);

		expect(exitCode).toBe(0);
		expect(configureOpenAPIForContainerPull).not.toHaveBeenCalled();
		expect(buildCommand).toHaveBeenCalledWith(
			expect.objectContaining({ push: false }),
			{ compliance_region: "public" }
		);
	});

	it("configures Cloudflare's registry when pushing", async () => {
		const { exitCode } = await runCf([
			"containers",
			"build",
			"./container",
			"--tag",
			"example/image:tag",
			"--push",
		]);

		expect(exitCode).toBe(0);
		expect(configureOpenAPIForContainerPull).toHaveBeenCalledWith(
			"test-account-id",
			"test-api-token",
			"https://api.cloudflare.com/client/v4"
		);
		expect(buildCommand).toHaveBeenCalledWith(
			{
				PATH: "./container",
				tag: "example/image:tag",
				push: true,
				pathToDocker: undefined,
			},
			{ compliance_region: "public" }
		);
	});

	it("uses the FedRAMP registry when pushing", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"--tag",
			"example/image:fedramp",
			"--push",
		]);

		expect(exitCode).toBe(0);
		expect(configureOpenAPIForContainerPull).toHaveBeenCalledWith(
			"test-account-id",
			"test-api-token",
			"https://api.fed.cloudflare.com/client/v4"
		);
		expect(buildCommand).toHaveBeenCalledWith(
			expect.objectContaining({ push: true }),
			{ compliance_region: "fedramp_high" }
		);
	});

	it("accepts the short tag and push aliases", async () => {
		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"-t",
			"example/image:alias",
			"-p",
		]);

		expect(exitCode).toBe(0);
		expect(buildCommand).toHaveBeenCalledWith(
			{
				PATH: ".",
				tag: "example/image:alias",
				push: true,
				pathToDocker: undefined,
			},
			{ compliance_region: "public" }
		);
	});

	it("forwards a custom Docker binary path", async () => {
		const { exitCode } = await runCf([
			"containers",
			"build",
			".",
			"--tag",
			"example/image:tag",
			"--path-to-docker",
			"/opt/docker/bin/docker",
		]);

		expect(exitCode).toBe(0);
		expect(buildCommand).toHaveBeenCalledWith(
			expect.objectContaining({ pathToDocker: "/opt/docker/bin/docker" }),
			{ compliance_region: "public" }
		);
	});

	it("shows the required path and tag without building", async () => {
		const { exitCode } = await runCf(["containers", "build", "--help"]);

		expect(exitCode).toBe(0);
		expect(std.out).toContain("<path>");
		expect(std.out).toContain("--tag");
		expect(std.out).toContain("--push");
		expect(std.out).toContain("--path-to-docker");
		expect(buildCommand).not.toHaveBeenCalled();
	});

	it("rejects local simulation mode", async () => {
		await expect(
			runCf(["containers", "build", ".", "--tag", "image:tag", "--local"])
		).rejects.toThrow("--local is not supported with `cf containers build`.");
		expect(buildCommand).not.toHaveBeenCalled();
	});
});

describe("containers build hand-written leaf", () => {
	it("is registered against the containers product", () => {
		expect(handWrittenLeafCommands("containers")).toContainEqual({
			kind: "leaf",
			dryRun: "preview",
			parent: "containers",
			name: "build",
			dir: "containers/build",
		});
	});

	it("fails clearly if the spec adds a build command", () => {
		const schema = {
			name: "containers",
			description: "Containers",
		} as Parameters<typeof generateResourceIndexFile>[0];

		expect(() => generateResourceIndexFile(schema, ["build"], [])).toThrow(
			'Hand-written leaf command "containers build" collides with a command or group of the same name in the spec.'
		);
	});

	it("keeps command metadata aligned with the implementation", () => {
		const registered = handWrittenLeafCommands("containers").find(
			(command) => command.name === "build"
		);
		if (registered === undefined) {
			throw new Error("containers build is not registered");
		}
		const meta = readHandWrittenLeafCommandMeta("containers", registered);

		expect(meta.command).toBe("cf containers build");
		expect(meta.fullPath).toEqual(["containers", "build"]);
		expect(meta.arguments).toEqual([
			expect.objectContaining({
				name: "path",
				position: 0,
				type: "string",
				required: true,
			}),
		]);
		expect(meta.options).toEqual([
			expect.objectContaining({ name: "tag", type: "string", required: true }),
			expect.objectContaining({
				name: "push",
				type: "boolean",
				required: false,
				default: false,
			}),
			expect.objectContaining({
				name: "path-to-docker",
				type: "string",
				required: false,
			}),
			expect.objectContaining({ name: "dry-run", type: "boolean" }),
		]);
		expect(meta.httpMethod).toBeUndefined();
		expect(meta.apiPath).toBeUndefined();
		expect(meta.operationId).toBeUndefined();
	});
});
