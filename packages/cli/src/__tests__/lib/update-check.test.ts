import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	getUpdateNotice,
	maybeStartBackgroundUpdateCheck,
	refreshUpdateCache,
	UPDATE_CHECK_INTERVAL_MS,
} from "../../lib/update-check.js";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));

interface StoredCache {
	lastAttemptedAt?: number;
	lastSuccessfulAt?: number;
	latestVersion?: string;
}

describe("update check", () => {
	runInTempDir();

	let cachePath: string;

	beforeEach(() => {
		cachePath = join(process.cwd(), "update-check.json");
		vi.mocked(spawn).mockReset();
	});

	function writeCache(cache: StoredCache): void {
		writeFileSync(cachePath, JSON.stringify(cache));
	}

	function readCache(): StoredCache {
		return JSON.parse(readFileSync(cachePath, "utf8")) as StoredCache;
	}

	it("claims a refresh before starting the detached worker", () => {
		const spawnWorker = vi.fn();

		maybeStartBackgroundUpdateCheck({ cachePath, now: 100, spawnWorker });

		expect(spawnWorker).toHaveBeenCalledOnce();
		expect(readCache()).toEqual({ lastAttemptedAt: 100 });
	});

	it("does not start another worker while the daily claim is fresh", () => {
		writeCache({ lastAttemptedAt: 100 });
		const spawnWorker = vi.fn();

		maybeStartBackgroundUpdateCheck({
			cachePath,
			now: 100 + UPDATE_CHECK_INTERVAL_MS - 1,
			spawnWorker,
		});

		expect(spawnWorker).not.toHaveBeenCalled();
	});

	it("starts another worker once the daily claim expires", () => {
		writeCache({ lastAttemptedAt: 100 });
		const spawnWorker = vi.fn();

		maybeStartBackgroundUpdateCheck({
			cachePath,
			now: 100 + UPDATE_CHECK_INTERVAL_MS,
			spawnWorker,
		});

		expect(spawnWorker).toHaveBeenCalledOnce();
		expect(readCache()).toEqual({
			lastAttemptedAt: 100 + UPDATE_CHECK_INTERVAL_MS,
		});
	});

	it("claims stable and beta refreshes independently", () => {
		const spawnWorker = vi.fn();

		maybeStartBackgroundUpdateCheck({
			currentVersion: "1.3.0-beta.1",
			now: 100,
			spawnWorker,
		});
		maybeStartBackgroundUpdateCheck({
			currentVersion: "1.2.3",
			now: 100,
			spawnWorker,
		});

		expect(spawnWorker).toHaveBeenCalledTimes(2);
		expect(
			JSON.parse(
				readFileSync(
					join(getCfConfigPath(), "cache", "update-check-beta.json"),
					"utf8"
				)
			)
		).toEqual({ lastAttemptedAt: 100 });
		expect(
			JSON.parse(
				readFileSync(
					join(getCfConfigPath(), "cache", "update-check-latest.json"),
					"utf8"
				)
			)
		).toEqual({ lastAttemptedAt: 100 });
	});

	it("silently retains the claim when spawning fails", () => {
		expect(() =>
			maybeStartBackgroundUpdateCheck({
				cachePath,
				now: 100,
				spawnWorker: () => {
					throw new Error("spawn failed");
				},
			})
		).not.toThrow();
		expect(readCache()).toEqual({ lastAttemptedAt: 100 });
	});

	it("spawns an unreferenced detached process by default", () => {
		const unref = vi.fn();
		vi.mocked(spawn).mockReturnValue({ unref } as never);

		maybeStartBackgroundUpdateCheck({ cachePath, now: 100 });

		expect(spawn).toHaveBeenCalledOnce();
		expect(spawn).toHaveBeenCalledWith(
			process.execPath,
			expect.arrayContaining([
				expect.stringMatching(/update-check-worker\.ts$/),
			]),
			expect.objectContaining({
				detached: true,
				stdio: "ignore",
				windowsHide: true,
			})
		);
		expect(unref).toHaveBeenCalledOnce();
	});

	it("returns a compact notice for a minor update", () => {
		writeCache({ latestVersion: "1.3.0" });

		expect(getUpdateNotice("1.2.3", cachePath)).toEqual({
			latestVersion: "1.3.0",
			isMajor: false,
		});
	});

	it("returns the prominent warning on every run for a major update", () => {
		writeCache({ latestVersion: "2.0.0" });

		const expected = {
			latestVersion: "2.0.0",
			isMajor: true,
		};
		expect(getUpdateNotice("1.2.3", cachePath)).toEqual(expected);
		expect(getUpdateNotice("1.2.3", cachePath)).toEqual(expected);
	});

	it("does not return a notice for equal, older, or invalid versions", () => {
		writeCache({ latestVersion: "1.2.3" });
		expect(getUpdateNotice("1.2.3", cachePath)).toBeUndefined();

		writeCache({ latestVersion: "1.1.0" });
		expect(getUpdateNotice("1.2.3", cachePath)).toBeUndefined();

		writeCache({ latestVersion: "not-semver" });
		expect(getUpdateNotice("1.2.3", cachePath)).toBeUndefined();
	});

	it("stores a valid registry response while preserving the claim", async () => {
		writeCache({ lastAttemptedAt: 100 });
		const fetchImpl = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ name: "cf", version: "2.1.0" }), {
				status: 200,
			})
		);

		await refreshUpdateCache({
			cachePath,
			fetch: fetchImpl,
			currentVersion: "1.2.3",
			now: 200,
		});

		expect(fetchImpl).toHaveBeenCalledWith(
			"https://registry.npmjs.org/cf/latest",
			expect.objectContaining({ signal: expect.any(AbortSignal) })
		);
		expect(readCache()).toEqual({
			lastAttemptedAt: 100,
			latestVersion: "2.1.0",
			lastSuccessfulAt: 200,
		});
	});

	it("checks the latest dist-tag for a beta prerelease", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ name: "cf", version: "1.3.0-beta.2" }), {
				status: 200,
			})
		);

		await refreshUpdateCache({
			currentVersion: "1.3.0-beta.1",
			fetch: fetchImpl,
			now: 200,
		});

		expect(fetchImpl).toHaveBeenCalledWith(
			"https://registry.npmjs.org/cf/latest",
			expect.objectContaining({ signal: expect.any(AbortSignal) })
		);
		expect(
			JSON.parse(
				readFileSync(
					join(getCfConfigPath(), "cache", "update-check-beta.json"),
					"utf8"
				)
			)
		).toEqual({
			latestVersion: "1.3.0-beta.2",
			lastSuccessfulAt: 200,
		});
	});

	it("stores the running version when npm reports it is up to date", async () => {
		writeCache({ lastAttemptedAt: 100, latestVersion: "2.0.0" });

		await refreshUpdateCache({
			cachePath,
			check: vi.fn().mockResolvedValue({ status: "up-to-date" }),
			currentVersion: "1.2.3",
			now: 200,
		});

		expect(readCache()).toEqual({
			lastAttemptedAt: 100,
			latestVersion: "1.2.3",
			lastSuccessfulAt: 200,
		});
	});

	it("ignores errors and failed or malformed checks", async () => {
		writeCache({ lastAttemptedAt: 100, latestVersion: "1.2.3" });

		await expect(
			refreshUpdateCache({
				cachePath,
				check: vi.fn().mockRejectedValue(new Error("offline")),
				currentVersion: "1.2.3",
				now: 200,
			})
		).resolves.toBeUndefined();
		await refreshUpdateCache({
			cachePath,
			check: vi.fn().mockResolvedValue({ status: "failed" }),
			currentVersion: "1.2.3",
			now: 300,
		});
		await refreshUpdateCache({
			cachePath,
			check: vi
				.fn()
				.mockResolvedValue({ status: "update-available", latest: "invalid" }),
			currentVersion: "1.2.3",
			now: 400,
		});

		expect(readCache()).toEqual({
			lastAttemptedAt: 100,
			latestVersion: "1.2.3",
		});
	});
});
