import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { clearLoadedProjectSettings } from "../../lib/project-settings.js";

const stdinTTY = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
const stdoutTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
let deviceAuthorizations = 0;

describe("implicit OAuth device login", () => {
	runInTempDir();
	mockConsoleMethods();
	const previousDispatcher = getGlobalDispatcher();
	const mockAgent = new MockAgent();

	beforeAll(() => {
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: true,
		});
		mockAgent.disableNetConnect();
		mockAgent
			.get("https://dash.cloudflare.com")
			.intercept({ path: "/", method: "GET" })
			.reply(200, "")
			.persist();
		mockAgent
			.get("https://dash.cloudflare.com")
			.intercept({ path: "/oauth2/device/auth", method: "POST" })
			.reply(400, () => {
				deviceAuthorizations += 1;
				return { error: "access_denied" };
			})
			.persist();
		setGlobalDispatcher(mockAgent);
	});

	afterAll(async () => {
		setGlobalDispatcher(previousDispatcher);
		await mockAgent.close();
		if (stdinTTY) {
			Object.defineProperty(process.stdin, "isTTY", stdinTTY);
		} else {
			Reflect.deleteProperty(process.stdin, "isTTY");
		}
		if (stdoutTTY) {
			Object.defineProperty(process.stdout, "isTTY", stdoutTTY);
		} else {
			Reflect.deleteProperty(process.stdout, "isTTY");
		}
	});

	beforeEach(() => {
		clearLoadedProjectSettings();
		vi.stubEnv("CI", "false");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CF_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CF_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.stubEnv("WRANGLER_API_ENVIRONMENT", undefined);
		vi.stubEnv("WRANGLER_AUTH_DOMAIN", undefined);
		deviceAuthorizations = 0;
	});

	it("starts exactly one device authorization when account resolution needs login", async () => {
		// Import after stubbing CI so workers-auth sees an interactive session.
		const { CF_CLI } = await import("@cloudflare/workers-auth/cf");
		const { getAccountId } = await import("../../lib/context.js");

		expect(CF_CLI.useDeviceFlowByDefault).toBe(true);
		// The mocked denial stops the flow before it opens a browser.
		await expect(getAccountId()).rejects.toThrow("OAuth error: access_denied");
		expect(deviceAuthorizations).toBe(1);
	});
});
