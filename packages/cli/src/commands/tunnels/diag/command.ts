import { CliExit } from "../../../lib/cli-exit.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface TunnelDiagArgs extends CommonYargsOptions {
	metrics?: string;
	"diag-container-id"?: string;
	"diag-pod-id"?: string;
	"no-diag-logs"?: boolean;
	"no-diag-metrics"?: boolean;
	"no-diag-network"?: boolean;
	"no-diag-runtime"?: boolean;
	"no-diag-system"?: boolean;
}

const command: CommandModule<CommonYargsOptions, TunnelDiagArgs> = {
	command: "diag",
	describe: "Create a diagnostic report from a local cloudflared instance.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<TunnelDiagArgs> =>
		yargs
			.parserConfiguration({ "boolean-negation": false })
			.option("metrics", {
				type: "string",
				description: "Metrics server address for the cloudflared instance",
			})
			.option("diag-container-id", {
				type: "string",
				description: "Container ID or name to collect logs from",
			})
			.option("diag-pod-id", {
				type: "string",
				description: "Kubernetes pod to collect logs from",
			})
			.option("no-diag-logs", {
				type: "boolean",
				description: "Exclude logs",
			})
			.option("no-diag-metrics", {
				type: "boolean",
				description: "Exclude metrics",
			})
			.option("no-diag-network", {
				type: "boolean",
				description: "Exclude network diagnostics",
			})
			.option("no-diag-runtime", {
				type: "boolean",
				description: "Exclude runtime information",
			})
			.option("no-diag-system", {
				type: "boolean",
				description: "Exclude system information",
			}) as Argv<TunnelDiagArgs>,
	handler: async (argv: ArgumentsCamelCase<TunnelDiagArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels diag.");
		}
		const args = ["tunnel", "diag"];
		if (argv.metrics) {
			args.push("--metrics", argv.metrics);
		}
		if (argv["diag-container-id"]) {
			args.push("--diag-container-id", argv["diag-container-id"]);
		}
		if (argv["diag-pod-id"]) {
			args.push("--diag-pod-id", argv["diag-pod-id"]);
		}
		for (const flag of [
			"no-diag-logs",
			"no-diag-metrics",
			"no-diag-network",
			"no-diag-runtime",
			"no-diag-system",
		] as const) {
			if (argv[flag]) {
				args.push(`--${flag}`);
			}
		}
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
