/* eslint-disable @typescript-eslint/consistent-type-imports */

// Pin cf's version string so snapshots don't churn on every release.
// cf's version.ts honours this env var ahead of both the build-time
// `define` injection and the package.json fallback. MUST be set
// before any import that transitively loads cf.
process.env.CLI_VERSION = "x.x.x";

import { PassThrough } from "node:stream";
import chalk from "chalk";
import { passthrough } from "msw";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { msw } from "./helpers/msw";

//turn off chalk for tests due to inconsistencies between operating systems
chalk.level = 0;

// In general we don't want the ConfigController to watch the config files
// as this tends to make the tests flaky.
// eslint-disable-next-line turbo/no-undeclared-env-vars
process.env.WRANGLER_CI_DISABLE_CONFIG_WATCHING = "true";

/**
 * The relative path between the bundled code and the Wrangler package.
 * This is used as a reliable way to compute paths relative to the Wrangler package
 * in the source files, rather than relying upon `__dirname` which can change depending
 * on whether the source files have been bundled and the location of the outdir.
 *
 * This is exposed in the source via the `getBasePath()` function, which should be used
 * in place of `__dirname` and similar Node.js constants.
 */
(
	global as unknown as { __RELATIVE_PACKAGE_PATH__: string }
).__RELATIVE_PACKAGE_PATH__ = "..";

vi.mock("ansi-escapes", () => {
	return {
		__esModule: true,
		default: vi.fn().mockImplementation(async (options) => options.port),
	};
});

// Mock out getPort since we don't actually care about what ports are open in unit tests.
vi.mock("get-port", async (importOriginal) => {
	const getPort = await importOriginal<typeof import("get-port")>();
	return {
		__esModule: true,
		default: vi.fn(getPort.default),
		portNumbers: getPort.portNumbers,
	};
});

vi.mock("child_process", async (importOriginal) => {
	const cp = await importOriginal<typeof import("child_process")>();
	return {
		...cp,
		default: cp,
		spawnSync: vi.fn().mockImplementation((binary, ...args) => {
			if (binary === "cloudflared") {
				return { error: true };
			}
			return cp.spawnSync(binary, ...args);
		}),
	};
});

vi.mock("os", async (importOriginal) => {
	const os = await importOriginal<typeof import("os")>();
	function homedir() {
		// Let's just grab the HOME env var and then we can override that in tests
		return (process.env as Record<string, string>).HOME;
	}
	return {
		...os,
		default: { ...os, homedir },
		homedir,
	};
});

vi.mock("log-update", () => {
	const fn = function (..._: string[]) {};
	fn["clear"] = () => {};
	fn["done"] = () => {};
	fn["createLogUpdate"] = () => fn;
	return fn;
});

vi.mock("../package-manager", async (importOriginal) => {
	const original = await importOriginal<typeof import("../package-manager")>();
	const mocked = Object.fromEntries(
		Object.entries(original).map(([key, value]) => {
			if (typeof value === "function") {
				// We want to mock all the functions in the module
				return [key, vi.fn()];
			}
			// Non-function values (such as the constants for the package managers) should not be mocked
			return [key, value];
		})
	);
	return mocked;
});

vi.mock("../update-check");

beforeAll(() => {
	msw.listen({
		onUnhandledRequest: (request) => {
			const { hostname, href } = new URL(request.url);
			const localHostnames = ["localhost", "127.0.0.1"]; // TODO: add other local hostnames if you need them
			if (localHostnames.includes(hostname)) {
				return passthrough();
			}

			throw new Error(
				`No mock found for ${request.method} ${href}
				`
			);
		},
	});
});
afterEach(() => {
	msw.restoreHandlers();
	msw.resetHandlers();
});
afterAll(() => msw.close());

// Make sure that we don't accidentally try to open a browser window when running tests.
// We will actually provide a mock implementation for `openInBrowser()` within relevant tests.
vi.mock("../open-in-browser");

// Mock the functions involved in getAuthURL so we don't take snapshots of the constantly changing URL.
vi.mock("../user/generate-auth-url", async (importOriginal) => {
	const OAUTH_CALLBACK_URL = (
		await importOriginal<typeof import("../user/generate-auth-url")>()
	).OAUTH_CALLBACK_URL;
	return {
		generateRandomState: vi.fn().mockImplementation(() => "MOCK_STATE_PARAM"),
		OAUTH_CALLBACK_URL,
		generateAuthUrl: vi
			.fn()
			.mockImplementation(({ authUrl, clientId, scopes }) => {
				return (
					authUrl +
					`?response_type=code&` +
					`client_id=${encodeURIComponent(clientId)}&` +
					`redirect_uri=${encodeURIComponent(OAUTH_CALLBACK_URL)}&` +
					// we add offline_access manually for every request
					`scope=${encodeURIComponent(
						[...scopes, "offline_access"].join(" ")
					)}&` +
					`state=MOCK_STATE_PARAM&` +
					`code_challenge=${encodeURIComponent("MOCK_CODE_CHALLENGE")}&` +
					`code_challenge_method=S256`
				);
			}),
	};
});

// Mock `ci-info` globally so tests run with CI detection disabled by default.
//
// IMPORTANT: only the default import (`import ci from "ci-info"`) can be controlled
// by vi.mocked(ci).isCI = true. Named imports (`import { isCI } from "ci-info"`)
// bind to the factory return value and cannot be reassigned — an ESLint rule in
// eslint.config.mjs enforces this.
vi.mock("ci-info", () => ({
	default: { isCI: false, CLOUDFLARE_PAGES: false, CLOUDFLARE_WORKERS: false },
	isCI: false,
	CLOUDFLARE_PAGES: false,
	CLOUDFLARE_WORKERS: false,
}));

// Reset `ci-info` mock after every test so individual overrides
// (e.g. `vi.mocked(ci).isCI = true`) don't leak between tests.
const _ci = await import("ci-info");
afterEach(() => {
	vi.mocked(_ci.default).isCI = false;
	vi.mocked(_ci.default).CLOUDFLARE_PAGES = false;
	vi.mocked(_ci.default).CLOUDFLARE_WORKERS = false;
});

vi.mock("../user/generate-random-state", () => {
	return {
		generateRandomState: vi.fn().mockImplementation(() => "MOCK_STATE_PARAM"),
	};
});

vi.mock("../metrics/metrics-config", async (importOriginal) => {
	const realModule =
		await importOriginal<typeof import("../metrics/metrics-config")>();
	vi.spyOn(realModule, "getMetricsConfig").mockImplementation(() => {
		return {
			enabled: false,
			deviceId: "mock-device",
			userId: undefined,
		};
	});
	return realModule;
});

// Route legacy `prompts({ type, message, name, ... })` calls through the
// shared mock-dialogs queues (in case any vendored helper still uses
// the npm `prompts` package).
vi.mock("prompts", async () => {
	const dialogs = await import("./helpers/mock-dialogs");
	const promptsImpl = (...args: unknown[]) => {
		const opts = args[0] as {
			type?: string;
			message?: string;
			initial?: unknown;
			style?: string;
			choices?: unknown;
		};
		if (!opts || typeof opts !== "object") {
			throw new Error(
				`Unexpected prompts() call: ${JSON.stringify(args).slice(0, 200)}`
			);
		}
		switch (opts.type) {
			case "confirm":
				return Promise.resolve({
					value: dialogs._consumeConfirm({
						message: opts.message ?? "",
						defaultValue: opts.initial as boolean | undefined,
					}),
				});
			case "text":
			case "password":
				return Promise.resolve({
					value: dialogs._consumePrompt({
						message: opts.message ?? "",
						defaultValue: opts.initial as string | undefined,
						isSecret: opts.style === "password" || opts.type === "password",
					}),
				});
			case "select":
				return Promise.resolve({
					value: dialogs._consumeSelect({
						message: opts.message ?? "",
						choices: opts.choices,
						defaultOption: opts.initial as number | undefined,
					}),
				});
			default:
				throw new Error(
					`Unsupported prompts() type: ${JSON.stringify(opts.type)}`
				);
		}
	};
	return { __esModule: true, default: vi.fn(promptsImpl) };
});

// `@clack/prompts` is intercepted via a vite alias (see vitest.config.mts
// → resolve.alias) — all imports across the workspace go to
// `helpers/clack-mock.ts`, which consumes from the same mock-dialogs
// queues `mockConfirm`/`mockPrompt`/`mockSelect` push to.

vi.mock("execa", async (importOriginal) => {
	const realModule = await importOriginal<typeof import("execa")>();
	return {
		...realModule,
		execa: vi.fn((...args: Parameters<typeof realModule.execa>) => {
			return args[0] === "mockpm"
				? Promise.resolve()
				: realModule.execa(...args);
		}),
	};
});

// Vitest 4's vi.unstubAllEnvs() does not reliably clean up process.env
// Track env keys before each test and remove additions afterward.
let envKeysBefore: Set<string>;
beforeEach(() => {
	envKeysBefore = new Set(Object.keys(process.env));
});
afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (!envKeysBefore.has(key)) {
			delete process.env[key];
		}
	}
	vi.clearAllMocks();
});

vi.mock("@cloudflare/cli-shared-helpers/streams", async () => {
	const stdout = new PassThrough();
	const stderr = new PassThrough();

	return {
		__esModule: true,
		stdout,
		stderr,
	};
});

vi.mock("../../package.json", () => {
	return {
		version: "x.x.x",
	};
});

// Disable subdomain mixed state check for tests (specific test will enable it).
beforeEach(() => {
	vi.stubEnv("WRANGLER_DISABLE_SUBDOMAIN_MIXED_STATE_CHECK", "true");
});
