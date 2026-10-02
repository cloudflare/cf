import {
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
	pushCommand,
} from "@cloudflare/containers-shared";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
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
		configureOpenAPIForContainerPull: vi.fn(),
		initContainersSharedContext: vi.fn(),
		pushCommand: vi.fn(),
	};
});

describe("cf containers push", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account-id");
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(pushCommand).mockResolvedValue(undefined);
	});

	it("pushes the requested local image through containers-shared", async () => {
		const { exitCode } = await runCf([
			"containers",
			"push",
			"--tag",
			"example/image:tag",
		]);

		expect(exitCode).toBe(0);
		expect(initContainersSharedContext).toHaveBeenCalledOnce();
		expect(configureOpenAPIForContainerPull).toHaveBeenCalledWith(
			"test-account-id",
			"test-api-token",
			"https://api.cloudflare.com/client/v4"
		);
		expect(pushCommand).toHaveBeenCalledWith(
			{ TAG: "example/image:tag", pathToDocker: undefined },
			"test-account-id",
			{ compliance_region: "public" }
		);
	});

	it("forwards a custom Docker binary path", async () => {
		const { exitCode } = await runCf([
			"containers",
			"push",
			"--tag",
			"example/image:tag",
			"--path-to-docker",
			"/custom/docker",
		]);

		expect(exitCode).toBe(0);
		expect(pushCommand).toHaveBeenCalledWith(
			{ TAG: "example/image:tag", pathToDocker: "/custom/docker" },
			"test-account-id",
			{ compliance_region: "public" }
		);
	});

	it("accepts -t as the tag alias", async () => {
		const { exitCode } = await runCf([
			"containers",
			"push",
			"-t",
			"example/image:alias",
		]);

		expect(exitCode).toBe(0);
		expect(pushCommand).toHaveBeenCalledWith(
			{ TAG: "example/image:alias", pathToDocker: undefined },
			"test-account-id",
			{ compliance_region: "public" }
		);
	});

	it("shows the required tag flag in help without pushing", async () => {
		const { exitCode } = await runCf(["containers", "push", "--help"]);

		expect(exitCode).toBe(0);
		expect(std.out).toContain("--tag");
		expect(std.out).toContain("-t");
		expect(std.out).toContain("--path-to-docker");
		expect(pushCommand).not.toHaveBeenCalled();
	});

	it("rejects local simulation mode", async () => {
		await expect(
			runCf(["containers", "push", "--tag", "example/image:tag", "--local"])
		).rejects.toThrow("--local is not supported with `cf containers push`.");
		expect(pushCommand).not.toHaveBeenCalled();
	});
});

describe("containers push hand-written leaf", () => {
	it("is registered against the containers product", () => {
		expect(handWrittenLeafCommands("containers")).toContainEqual({
			kind: "leaf",
			parent: "containers",
			name: "push",
			dir: "containers/push",
		});
	});

	it("fails clearly if the spec adds a push command", () => {
		const schema = {
			name: "containers",
			description: "Containers",
		} as Parameters<typeof generateResourceIndexFile>[0];

		expect(() => generateResourceIndexFile(schema, ["push"], [])).toThrow(
			'Hand-written leaf command "containers push" collides with a command or group of the same name in the spec.'
		);
	});

	it("keeps command metadata aligned with the implementation", () => {
		const registered = handWrittenLeafCommands("containers").find(
			(command) => command.name === "push"
		);
		if (registered === undefined) {
			throw new Error("containers push is not registered");
		}
		const meta = readHandWrittenLeafCommandMeta("containers", registered);

		expect(meta.command).toBe("cf containers push");
		expect(meta.fullPath).toEqual(["containers", "push"]);
		expect(meta.arguments).toEqual([]);
		expect(meta.options).toEqual([
			expect.objectContaining({
				name: "tag",
				type: "string",
				required: true,
			}),
			expect.objectContaining({
				name: "path-to-docker",
				type: "string",
				required: false,
			}),
		]);
		expect(meta.httpMethod).toBeUndefined();
		expect(meta.apiPath).toBeUndefined();
		expect(meta.operationId).toBeUndefined();
	});
});
