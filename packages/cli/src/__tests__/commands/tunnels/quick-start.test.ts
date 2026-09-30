import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf tunnels quick-start", () => {
	beforeEach(() => {
		vi.mocked(runCloudflared).mockReset();
	});

	it("forwards quick-tunnel arguments to cloudflared", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(0);

		const result = await runCf([
			"tunnels",
			"quick-start",
			"http://localhost:3000",
			"--log-level",
			"trace",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"--url",
			"http://localhost:3000",
			"--loglevel",
			"trace",
		]);
	});

	it.each([
		{
			name: "repeated flags",
			flags: [
				"--allowed-mail",
				"alice@example.com",
				"--allowed-mail",
				"bob@example.com",
			],
			recipients: ["alice@example.com", "bob@example.com"],
		},
		{
			name: "comma-separated addresses",
			flags: ["--allowed-mail", "alice@example.com,bob@example.com"],
			recipients: ["alice@example.com,bob@example.com"],
		},
		{
			name: "wildcard domain",
			flags: ["--allowed-mail", "*@example.org"],
			recipients: ["*@example.org"],
		},
		{
			name: "equals-style flag",
			flags: ["--allowed-mail=alice@example.com"],
			recipients: ["alice@example.com"],
		},
	])(
		"forwards $name unchanged to cloudflared",
		async ({ flags, recipients }) => {
			vi.mocked(runCloudflared).mockResolvedValueOnce(0);

			const result = await runCf([
				"tunnels",
				"quick-start",
				"http://localhost:3000",
				...flags,
			]);

			expect(result.exitCode).toBe(0);
			expect(runCloudflared).toHaveBeenCalledWith([
				"tunnel",
				"--url",
				"http://localhost:3000",
				"--loglevel",
				"info",
				...recipients.flatMap((recipient) => ["--allowed-mail", recipient]),
			]);
		}
	);

	it("accepts allowed mail before the positional URL", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(0);

		await runCf([
			"tunnels",
			"quick-start",
			"--allowed-mail",
			"alice@example.com",
			"http://localhost:3000",
		]);

		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"--url",
			"http://localhost:3000",
			"--loglevel",
			"info",
			"--allowed-mail",
			"alice@example.com",
		]);
	});

	it.each([
		["--allowed-mail"],
		["--allowed-mail", "--log-level", "debug"],
		["--allowed-mail", "alice@example.com", "--allowed-mail"],
	])("rejects a missing recipient in %j before launching", async (...flags) => {
		await expect(
			runCf(["tunnels", "quick-start", "http://localhost:3000", ...flags])
		).rejects.toThrow("Not enough arguments following: allowed-mail");

		expect(runCloudflared).not.toHaveBeenCalled();
	});

	it("rejects local mode instead of silently ignoring it", async () => {
		await expect(
			runCf([
				"tunnels",
				"quick-start",
				"http://localhost:3000",
				"--local",
				"--persist-to",
				"state",
			])
		).rejects.toThrow("--local is not supported by cf tunnels quick-start.");
	});

	it("propagates cloudflared's exit code", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(7);

		const result = await runCf([
			"tunnels",
			"quick-start",
			"http://localhost:3000",
		]);

		expect(result.exitCode).toBe(7);
	});
});
