import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { sparkline } from "../../commands/speedtest/index.js";
import {
	jitter,
	parseDataCenter,
	parseServerTime,
	percentile,
} from "../../commands/speedtest/measure.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const DOWN_URL = "https://speed.cloudflare.com/__down";
const UP_URL = "https://speed.cloudflare.com/__up";

describe("speed test calculations", () => {
	it("draws the latest samples as bars scaled to the largest", () => {
		expect(sparkline([])).toBe("");
		expect(sparkline([0, 0])).toBe("▁▁");
		expect(sparkline([0, 1, 2, 3, 4, 5, 6, 7])).toBe("▁▂▃▄▅▆▇█");
		expect(sparkline(Array.from({ length: 30 }, (_, i) => i))).toHaveLength(24);
	});

	it("interpolates percentiles", () => {
		expect(percentile([], 0.5)).toBe(0);
		expect(percentile([3, 1, 2], 0.5)).toBe(2);
		expect(percentile([10, 20], 0.5)).toBe(15);
		expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.9)).toBeCloseTo(9.1);
	});

	it("averages the differences between consecutive pings", () => {
		expect(jitter([12])).toBeNull();
		expect(jitter([10, 20, 15, 15])).toBe(5);
	});

	it("reads the server's processing time from Server-Timing", () => {
		expect(parseServerTime(null)).toBe(0);
		expect(
			parseServerTime(
				"cfSpeedEdge;dur=7, cfSpeedWorker;dur=36, cfReqDur;dur=54.283"
			)
		).toBe(54.283);
		expect(parseServerTime("cfSpeedEdge;dur=7, cfSpeedWorker;dur=36")).toBe(43);
		expect(parseServerTime('cfL4;desc="?proto=TCP&rtt=0"')).toBe(0);
	});

	it("reads the data center from cf-ray", () => {
		expect(parseDataCenter("8f2b4c1d2e3f4a5b-LHR")).toBe("LHR");
		expect(parseDataCenter("a4eab98078a888b7-SFO-DOG")).toBe("SFO");
		expect(parseDataCenter("invalid")).toBeUndefined();
		expect(parseDataCenter(null)).toBeUndefined();
	});
});

describe("cf speedtest", () => {
	runInTempDir();
	setupMsw();
	let output: ReturnType<typeof captureOutput>;
	let clock: number;

	beforeEach(() => {
		output = captureOutput();
		vi.stubEnv("CI", "true");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		clock = 0;
		vi.spyOn(performance, "now").mockImplementation(() => clock);
	});
	afterEach(() => vi.restoreAllMocks());

	it("measures without authentication and returns JSON", async () => {
		const requests: string[] = [];
		const headers: Headers[] = [];
		let latencyRequests = 0;
		server.use(
			http.get(DOWN_URL, ({ request }) => {
				const bytes = Number(new URL(request.url).searchParams.get("bytes"));
				requests.push(`down ${bytes}`);
				headers.push(request.headers);
				if (bytes === 0) {
					// Alternating 25ms and 15ms pings once the server's 5ms is removed.
					clock += latencyRequests++ % 2 === 1 ? 30 : 20;
					return new HttpResponse(null, {
						headers: {
							"cf-ray": "8f2b4c1d2e3f4a5b-LHR",
							"server-timing": "cfSpeedWorker;dur=2, cfReqDur;dur=5",
						},
					});
				}
				clock += bytes / 500;
				return new HttpResponse(new Uint8Array(bytes));
			}),
			http.post(UP_URL, async ({ request }) => {
				const bytes = (await request.arrayBuffer()).byteLength;
				requests.push(`up ${bytes}`);
				clock += bytes / 250;
				return new HttpResponse(null);
			})
		);

		expect(await runCf(["speedtest"])).toEqual({ exitCode: 0 });

		expect(JSON.parse(output.stdout())).toEqual({
			downloadMbps: 4.02,
			uploadMbps: 2.01,
			latencyMs: 20,
			jitterMs: 10,
			dataCenter: "LHR",
		});
		// Each direction stops after its first set of requests over a second.
		expect(requests).toEqual([
			...Array<string>(21).fill("down 0"),
			...Array<string>(10).fill("down 100000"),
			...Array<string>(8).fill("down 1000000"),
			...Array<string>(8).fill("up 100000"),
			...Array<string>(6).fill("up 1000000"),
		]);
		for (const header of headers) {
			expect(header.get("authorization")).toBeNull();
			expect(header.get("user-agent")).toMatch(/^cf-cli\//);
		}
	});

	it("accepts the speed-test alias", async () => {
		expect(await runCf(["speed-test", "--dry-run"])).toEqual({ exitCode: 0 });
		expect(JSON.parse(output.stdout())).toMatchObject({
			command: "cf speed-test",
			executed: false,
		});
	});

	it.each([
		[503, "Speed test request failed (HTTP 503)."],
		[429, "speed.cloudflare.com is rate limiting requests. Try again later."],
	])("reports HTTP %i without emitting results", async (status, message) => {
		server.use(http.get(DOWN_URL, () => new HttpResponse(null, { status })));
		await expect(runCf(["speedtest"])).rejects.toThrow(message);
		expect(output.stdout()).toBe("");
	});

	it("reports a network failure", async () => {
		server.use(http.get(DOWN_URL, () => HttpResponse.error()));
		await expect(runCf(["speedtest"])).rejects.toThrow(
			"Unable to reach speed.cloudflare.com."
		);
		expect(output.stdout()).toBe("");
	});

	it("reports a timeout", async () => {
		vi.spyOn(AbortSignal, "timeout").mockReturnValue(
			AbortSignal.abort(new DOMException("Timed out", "TimeoutError"))
		);
		server.use(http.get(DOWN_URL, () => new HttpResponse(null)));
		await expect(runCf(["speedtest"])).rejects.toThrow(
			"The speed test timed out."
		);
		expect(output.stdout()).toBe("");
	});
});
