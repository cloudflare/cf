import type { CommandMeta } from "../../lib/command-meta.js";

export default [
	{
		command: "cf speedtest",
		name: "speedtest",
		fullPath: ["speedtest"],
		aliases: ["speed-test"],
		category: "read",
		description:
			"Measure download and upload speed, latency, and jitter between this machine and Cloudflare's network using speed.cloudflare.com. Returns JSON with speeds in Mbps, latency and jitter in milliseconds, and the IATA code of the Cloudflare data center that served the test. No Cloudflare login is required.",
		summary: "Measure your connection's speed to Cloudflare",
		usage: "cf speedtest",
		arguments: [],
		options: [
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				description:
					"Parse arguments and show the command without executing it",
				default: false,
			},
		],
	},
] satisfies CommandMeta[];
