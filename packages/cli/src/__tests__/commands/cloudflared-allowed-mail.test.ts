import childProcess from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnCloudflared } from "@cloudflare/workers-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Exercise the installed workers-utils patch rather than mocking its API.
describe("email-protected cloudflared", () => {
	let binaryDir: string;
	let binaryPath: string;

	beforeEach(() => {
		binaryDir = mkdtempSync(join(tmpdir(), "cf-cloudflared-"));
		binaryPath = join(binaryDir, "cloudflared test.exe");
		writeFileSync(binaryPath, "test binary");
		vi.stubEnv("CLOUDFLARED_PATH", binaryPath);
		vi.spyOn(childProcess, "execFileSync").mockReturnValue(
			"cloudflared version 2026.9.2"
		);
		vi.spyOn(childProcess, "spawn").mockReturnValue(
			new childProcess.ChildProcess()
		);
		syncBuiltinESMExports();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		syncBuiltinESMExports();
		rmSync(binaryDir, { recursive: true, force: true });
	});

	it.each(["2025.12.0", "2026.8.3", "2026.9.0", "2026.9.1"])(
		"rejects version %s before spawning even if update checks are disabled",
		async (version) => {
			vi.mocked(childProcess.execFileSync).mockReturnValue(
				`cloudflared version ${version}`
			);

			await expect(
				spawnCloudflared(["tunnel", "--allowed-mail", "alice@example.com"], {
					skipVersionCheck: true,
				})
			).rejects.toThrow(
				"--allowed-mail requires cloudflared 2026.9.2 or later"
			);

			expect(childProcess.spawn).not.toHaveBeenCalled();
		}
	);

	it.each(["unrecognised version", "failed version command"])(
		"rejects a binary with %s before spawning",
		async (failure) => {
			vi.mocked(childProcess.execFileSync).mockImplementation(() => {
				if (failure === "failed version command") {
					throw new Error("version command failed");
				}
				return "cloudflared development build";
			});

			await expect(
				spawnCloudflared(["tunnel", "--allowed-mail", "alice@example.com"])
			).rejects.toThrow(
				"Could not determine the version of the selected binary"
			);

			expect(childProcess.spawn).not.toHaveBeenCalled();
		}
	);

	it("checks equals-style allowed mail and gives upgrade instructions", async () => {
		vi.mocked(childProcess.execFileSync).mockReturnValue(
			"cloudflared version 2026.9.1"
		);

		await expect(
			spawnCloudflared(["tunnel", "--allowed-mail=alice@example.com"])
		).rejects.toThrow(
			"Update cloudflared in your PATH or set CLOUDFLARED_PATH to a compatible binary"
		);
		expect(childProcess.spawn).not.toHaveBeenCalled();
	});

	it.each(["2026.9.2", "2026.9.3", "2026.10.0", "2027.1.0"])(
		"starts a protected tunnel with version %s without shell quoting",
		async (version) => {
			vi.mocked(childProcess.execFileSync).mockReturnValue(
				`cloudflared version ${version}`
			);
			const args = ["tunnel", "--allowed-mail", "*@example.org"];

			await spawnCloudflared(args);

			expect(childProcess.execFileSync).toHaveBeenCalledWith(
				binaryPath,
				["--version"],
				expect.objectContaining({ encoding: "utf8", timeout: 10_000 })
			);
			expect(childProcess.spawn).toHaveBeenCalledWith(binaryPath, args, {
				stdio: "inherit",
				env: undefined,
			});
		}
	);

	it("starts a public tunnel without checking the email-protection version", async () => {
		vi.mocked(childProcess.execFileSync).mockReturnValue(
			"cloudflared version 2026.9.1"
		);

		await spawnCloudflared(["tunnel", "--url", "http://localhost:3000"]);

		expect(childProcess.execFileSync).not.toHaveBeenCalled();
		expect(childProcess.spawn).toHaveBeenCalledOnce();
	});

	it("redacts all recipient rules and tokens in debug logs without changing arguments", async () => {
		const debug = vi.fn();
		const args = [
			"tunnel",
			"--allowed-mail",
			"alice@example.com,bob@example.com",
			"--allowed-mail=*@example.org",
			"--token",
			"secret-token",
		];

		await spawnCloudflared(args, {
			logger: { debug, log: vi.fn(), warn: vi.fn() },
		});

		expect(debug).toHaveBeenCalledWith(
			`Spawning cloudflared: ${binaryPath} tunnel --allowed-mail [REDACTED] --allowed-mail=[REDACTED] --token [REDACTED]`
		);
		expect(childProcess.spawn).toHaveBeenCalledWith(binaryPath, args, {
			stdio: "inherit",
			env: undefined,
		});
	});
});
