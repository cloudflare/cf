import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";

/**
 * Unit tests for `lib/request-headers.ts` — the default outbound headers
 * (`User-Agent`, `X-CF-CLI-Mode`, optional `X-CF-CLI-Agent`) stamped on
 * every Cloudflare request.
 *
 * The execution-mode + agent detection depend on ambient state (TTY, CI
 * env, agentic harness) that a test process can't reliably reproduce, so
 * the three signal sources are mocked:
 *   - `isInteractive` (cli-shared-helpers) — TTY detection
 *   - `isCI` (lib/interactive) — CI detection
 *   - `detectAgentContext` (lib/agent-context) — agent harness id
 *
 * `vi.hoisted` shares mutable state with the (hoisted) `vi.mock`
 * factories so each test can dial the signals independently.
 */

const mocks = vi.hoisted(() => ({
	isInteractive: vi.fn<() => boolean>(),
	isCI: false,
	detectAgentContext: vi.fn<
		() => {
			isAgentic: boolean;
			harness: { id: string } | null;
			model?: { id: string } | null;
			sessionId?: string | null;
		}
	>(),
}));

vi.mock("@cloudflare/cli-shared-helpers/interactive", () => ({
	isInteractive: mocks.isInteractive,
}));

vi.mock("../../lib/interactive.js", () => ({
	get isCI() {
		return mocks.isCI;
	},
	isNonInteractiveOrCI: () => mocks.isCI || !mocks.isInteractive(),
}));

vi.mock("../../lib/agent-context.js", () => ({
	detectAgentContext: mocks.detectAgentContext,
}));

// Imported after the mocks are registered.
const { detectCLIMode, getDefaultHeaders } =
	await import("../../lib/request-headers.js");

describe("request-headers", () => {
	beforeEach(() => {
		mocks.isCI = false;
		mocks.isInteractive.mockReturnValue(true);
		mocks.detectAgentContext.mockReturnValue({
			isAgentic: false,
			harness: null,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("detectCLIMode", () => {
		it("reports 'ci' when running in CI (regardless of TTY)", () => {
			mocks.isCI = true;
			mocks.isInteractive.mockReturnValue(true);
			expect(detectCLIMode()).toBe("ci");
		});

		it("reports 'interactive' when a TTY is attached and not CI", () => {
			mocks.isInteractive.mockReturnValue(true);
			expect(detectCLIMode()).toBe("interactive");
		});

		it("reports 'non-interactive' with no TTY and not CI", () => {
			mocks.isInteractive.mockReturnValue(false);
			expect(detectCLIMode()).toBe("non-interactive");
		});
	});

	describe("getDefaultHeaders", () => {
		it("always carries a cf-cli/<version> User-Agent", () => {
			const headers = getDefaultHeaders();
			expect(headers["User-Agent"]).toMatch(/^cf-cli\/.+/);
		});

		it("includes the detected CLI mode", () => {
			mocks.isInteractive.mockReturnValue(false);
			expect(getDefaultHeaders()["X-CF-CLI-Mode"]).toBe("non-interactive");
		});

		it("omits X-CF-CLI-Agent outside an agentic environment", () => {
			mocks.detectAgentContext.mockReturnValue({
				isAgentic: false,
				harness: null,
			});
			expect(getDefaultHeaders()).not.toHaveProperty("X-CF-CLI-Agent");
		});

		it("adds X-CF-CLI-Agent with the harness id when agentic", () => {
			mocks.detectAgentContext.mockReturnValue({
				isAgentic: true,
				harness: { id: "codex" },
			});
			expect(getDefaultHeaders()["X-CF-CLI-Agent"]).toBe("codex");
		});

		it("does not emit model or session identifiers", () => {
			mocks.detectAgentContext.mockReturnValue({
				isAgentic: true,
				harness: { id: "pi" },
				model: { id: "private-model" },
				sessionId: "private-session",
			});

			const serialized = JSON.stringify(getDefaultHeaders());
			expect(serialized).toContain("pi");
			expect(serialized).not.toContain("private-model");
			expect(serialized).not.toContain("private-session");
		});

		it("omits X-CF-CLI-Agent when agentic but the id is null", () => {
			mocks.detectAgentContext.mockReturnValue({
				isAgentic: true,
				harness: null,
			});
			expect(getDefaultHeaders()).not.toHaveProperty("X-CF-CLI-Agent");
		});
	});
});
