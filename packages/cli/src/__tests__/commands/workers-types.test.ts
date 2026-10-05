import { readFile, stat, utimes } from "node:fs/promises";
import path from "node:path";
import * as runtimeTypes from "@cloudflare/runtime-types";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

const RUNTIME_TYPES_MARKER = "// Begin mocked runtime types";
const TYPES_PATH = path.join(".cloudflare", "types", "index.d.ts");

vi.mock("@cloudflare/runtime-types", () => ({
	RUNTIME_TYPES_MARKER: "// Begin mocked runtime types",
	generateRuntimeTypes: vi.fn(),
}));

function workerConfig(
	compatibilityDate = "2026-09-01",
	compatibilityFlags = ["nodejs_compat"]
): string {
	return `export default {
	worker: {
		name: "example-worker",
		compatibilityDate: ${JSON.stringify(compatibilityDate)},
		compatibilityFlags: ${JSON.stringify(compatibilityFlags)},
	},
};`;
}

describe("cf workers types", () => {
	runInTempDir();
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
		vi.clearAllMocks();
		vi.mocked(runtimeTypes.generateRuntimeTypes).mockResolvedValue({
			runtimeHeader: "// Runtime types header",
			runtimeTypes: "declare const runtimeBinding: Fetcher;\n",
			isCached: false,
		});
	});

	it("generates inferred and runtime types by default", async () => {
		await seed({ "cloudflare.config.ts": workerConfig() });

		await runCf(["workers", "types"]);

		expect(runtimeTypes.generateRuntimeTypes).toHaveBeenCalledWith({
			compatibilityDate: "2026-09-01",
			compatibilityFlags: ["nodejs_compat"],
			existingContent: undefined,
		});
		const generated = await readFile(TYPES_PATH, "utf8");
		expect(generated).toContain('import("cf/config").UnwrapConfig');
		expect(generated).toContain('import("../../cloudflare.config").default');
		expect(generated).toContain("// Runtime types header");
		expect(generated).toContain(RUNTIME_TYPES_MARKER);
		expect(generated).toContain("declare const runtimeBinding: Fetcher;");
		expect(JSON.parse(output.stdout())).toEqual({ path: TYPES_PATH });
	});

	it("omits runtime types when --include-runtime=false", async () => {
		await seed({ "cloudflare.config.ts": workerConfig() });

		await runCf(["workers", "types", "--include-runtime", "false"]);

		expect(runtimeTypes.generateRuntimeTypes).not.toHaveBeenCalled();
		const generated = await readFile(TYPES_PATH, "utf8");
		expect(generated).toContain('import("cf/config").UnwrapConfig');
		expect(generated).not.toContain(RUNTIME_TYPES_MARKER);
	});

	it("passes the existing declaration to the runtime-types cache", async () => {
		await seed({
			"cloudflare.config.ts": workerConfig(),
			[TYPES_PATH]: "existing declaration",
		});

		await runCf(["workers", "types"]);

		expect(runtimeTypes.generateRuntimeTypes).toHaveBeenCalledWith(
			expect.objectContaining({ existingContent: "existing declaration" })
		);
	});

	it("does not rewrite unchanged output", async () => {
		await seed({ "cloudflare.config.ts": workerConfig() });
		await runCf(["workers", "types"]);
		const unchangedTime = new Date("2020-01-01T00:00:00.000Z");
		await utimes(TYPES_PATH, unchangedTime, unchangedTime);

		await runCf(["workers", "types"]);

		expect((await stat(TYPES_PATH)).mtimeMs).toBe(unchangedTime.getTime());
	});

	it("uses --mode when evaluating function-form config", async () => {
		await seed({
			"cloudflare.config.ts": `export default ({ mode }) => ({
	worker: {
		name: "example-worker",
		compatibilityDate: mode === "staging" ? "2026-09-02" : "2026-09-01",
	},
});`,
		});

		await runCf(["workers", "types", "--mode", "staging"]);

		expect(runtimeTypes.generateRuntimeTypes).toHaveBeenCalledWith(
			expect.objectContaining({ compatibilityDate: "2026-09-02" })
		);
	});

	it("requires cloudflare.config.ts", async () => {
		await expect(runCf(["workers", "types"])).rejects.toThrow(
			"cloudflare.config.ts is required by cf workers types."
		);
	});

	it("requires a Worker definition", async () => {
		await seed({ "cloudflare.config.ts": "export default {};" });

		await expect(runCf(["workers", "types"])).rejects.toThrow(
			"cloudflare.config.ts must define a Worker to generate types."
		);
	});

	it("rejects --local", async () => {
		await expect(runCf(["workers", "types", "--local"])).rejects.toThrow(
			"--local is not supported by cf workers types."
		);
	});
});
