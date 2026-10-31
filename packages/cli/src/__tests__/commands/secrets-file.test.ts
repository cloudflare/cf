import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../helpers/mock-deploy-context.js";
import { setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import "../../lib/auth.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	workerConfig,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe.each([
	{ name: "cf deploy", command: ["deploy"] },
	{
		name: "cf workers versions create",
		command: ["workers", "versions", "create"],
	},
])("$name --secrets-file", ({ command }) => {
	setupMsw();
	runInTempDir();
	mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		mockExistingWorker({ lastDeployedFrom: "cf_cli" });
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});
	});

	it("expands declared dotenv secrets without mutating the process environment", async () => {
		const upload = mockWorkerUpload();
		await seed({
			"secrets.env": [
				"CF_TEST_FROM_PROCESS=${CF_TEST_CI_SECRET}",
				"CF_TEST_FILE_VERSION=v1",
				"CF_TEST_FROM_FILE=https://example.com/$CF_TEST_FILE_VERSION",
				"CF_TEST_ESCAPED_SECRET=\\${CF_TEST_CI_SECRET}",
				"CF_TEST_CI_SECRET=file-value",
				"CF_TEST_EMPTY_SECRET=file-value",
				"CF_TEST_PASSWORD=pa$CF_TEST_MISSING_SECRET",
				"cf_test_mixed_case_secret=file-value",
			].join("\n"),
		});

		const { exitCode } = await runCf(
			[...command, "--prebuilt", "--secrets-file", "secrets.env"],
			{
				CF_TEST_CI_SECRET: "process-value",
				CF_TEST_EMPTY_SECRET: "",
				CF_TEST_FILE_VERSION: undefined,
				CF_TEST_MISSING_SECRET: undefined,
				CF_TEST_UNLISTED_SECRET: "must-not-be-uploaded",
				CF_TEST_MIXED_CASE_SECRET: "process-value",
			}
		);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.bindings).toEqual(
			Object.entries({
				CF_TEST_FROM_PROCESS: "process-value",
				CF_TEST_FILE_VERSION: "v1",
				CF_TEST_FROM_FILE: "https://example.com/v1",
				CF_TEST_ESCAPED_SECRET: "${CF_TEST_CI_SECRET}",
				CF_TEST_CI_SECRET: "process-value",
				CF_TEST_EMPTY_SECRET: "",
				CF_TEST_PASSWORD: "pa",
				cf_test_mixed_case_secret:
					process.platform === "win32" ? "process-value" : "file-value",
			}).map(([name, text]) => ({ name, text, type: "secret_text" }))
		);
		expect(process.env.CF_TEST_FILE_VERSION).toBeUndefined();
		expect(process.env.CF_TEST_CI_SECRET).toBe("process-value");
		expect(process.env.CF_TEST_EMPTY_SECRET).toBe("");
	});

	it("preserves JSON secrets literally without process overrides", async () => {
		const upload = mockWorkerUpload();
		const secrets = {
			CF_TEST_CI_SECRET: "${CF_TEST_CI_SECRET}",
			CF_TEST_PASSWORD: "pa$CF_TEST_MISSING_SECRET",
			CF_TEST_EMPTY_SECRET: "file-value",
		};
		await seed({ "secrets.json": JSON.stringify(secrets) });

		const { exitCode } = await runCf(
			[...command, "--prebuilt", "--secrets-file", "secrets.json"],
			{ CF_TEST_CI_SECRET: "process-value", CF_TEST_EMPTY_SECRET: "" }
		);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.bindings).toEqual(
			Object.entries(secrets).map(([name, text]) => ({
				name,
				text,
				type: "secret_text",
			}))
		);
	});
});
