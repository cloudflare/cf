import { describe, expect, it, vi } from "vitest";
import { renderPromptIntro } from "../../lib/ui/banner.js";

/**
 * The banner doubles as cf's delegation indicator: when a global cf
 * delegates to a project-pinned copy, the delegated child appends a dim
 * "· delegated" tag to the headline so it's clear why the running
 * version may differ from the global cf the user invoked. The signal is
 * the `CF_DELEGATION` sentinel the child is spawned with (see
 * lib/delegate.ts). `unstubEnvs: true` (vitest.config.mts) auto-restores
 * the env after each test.
 */
describe("renderPromptIntro", () => {
	it("renders only the running version in a normal (non-delegated) run", () => {
		vi.stubEnv("CF_DELEGATION", undefined);

		const out = renderPromptIntro("1.2.3");
		expect(out).toContain("v1.2.3");
		expect(out).not.toMatch(/delegated/);
	});

	it("appends a dim '· delegated' tag to the headline when delegated", () => {
		vi.stubEnv("CF_DELEGATION", "1");

		const out = renderPromptIntro("1.2.3");
		// Headline still shows the running (local) version…
		expect(out).toContain("v1.2.3");
		// …with a "delegated" tag appended.
		expect(out).toMatch(/delegated/);
	});

	it("adds a compact statusline note for an available update", () => {
		const out = renderPromptIntro("1.2.3", {
			latestVersion: "1.3.0",
			isMajor: false,
		});

		expect(out).toContain("update available: v1.3.0");
		expect(out).not.toContain("Updating is recommended");
	});

	it("adds a prominent warning for every run with a major update", () => {
		const out = renderPromptIntro("1.2.3", {
			latestVersion: "2.0.0",
			isMajor: true,
		});

		expect(out).toContain("update available: v2.0.0");
		expect(out).toContain("A new major version of cf is available");
		expect(out).toContain("Updating is recommended");
	});
});
