import { formatOutput } from "../../lib/output.js";
import { withProgress } from "../../lib/progress.js";
import { theme } from "../../lib/ui/index.js";
import {
	bandwidthBps,
	jitter,
	latencyMs,
	measureBandwidth,
	measureLatency,
	summarize,
	type BandwidthSample,
} from "./measure.js";
import type { CommandModule } from "yargs";

const BARS = "▁▂▃▄▅▆▇█";
const SPARKLINE_WIDTH = 24;

/** The latest values as bars, scaled to the largest of them. */
export function sparkline(values: readonly number[]): string {
	const recent = values.slice(-SPARKLINE_WIDTH);
	const max = Math.max(...recent);
	return recent
		.map((value) =>
			max > 0 ? BARS[Math.round((value / max) * (BARS.length - 1))] : BARS[0]
		)
		.join("");
}

function reading(
	label: string,
	value: string,
	values: readonly number[]
): string {
	return `${label.padEnd(9)}${theme.brand(value.padEnd(16))}${theme.muted(sparkline(values))}`;
}

function latencyReading(pings: readonly number[]): string {
	const spread = jitter(pings) ?? 0;
	return reading(
		"Latency",
		`${latencyMs(pings).toFixed(1)} ms ±${spread.toFixed(1)}`,
		pings
	);
}

function speedReading(
	label: string,
	samples: readonly BandwidthSample[]
): string {
	const mbps = bandwidthBps(samples) / 1e6;
	return reading(
		label,
		`${mbps.toFixed(1)} Mbps`,
		samples.map(({ bps }) => bps)
	);
}

const speedtest: CommandModule & { describe: string } = {
	command: "speedtest",
	describe: "Measure your connection's speed to Cloudflare",
	builder: (yargs) =>
		yargs
			.example("cf speedtest", "Measure download, upload, latency, and jitter")
			.epilogue(
				"Measures against speed.cloudflare.com and prints JSON with speeds in Mbps and latency and jitter in milliseconds. No Cloudflare login is required."
			),
	// Each reading updates live on stderr and stays once measured; stdout
	// carries only the JSON result.
	handler: async () => {
		const latency = await withProgress("Latency", (update) =>
			measureLatency((pings) => update(latencyReading(pings)))
		);
		const download = await withProgress("Download", (update) =>
			measureBandwidth("download", (samples) =>
				update(speedReading("Download", samples))
			)
		);
		const upload = await withProgress("Upload", (update) =>
			measureBandwidth("upload", (samples) =>
				update(speedReading("Upload", samples))
			)
		);
		formatOutput(summarize(latency, download, upload));
	},
};

export default speedtest;
