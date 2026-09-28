import { CliExit } from "../../../lib/cli-exit.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface TunnelReadyArgs extends CommonYargsOptions {
	metrics: string;
}

const command: CommandModule<CommonYargsOptions, TunnelReadyArgs> = {
	command: "ready",
	describe:
		"Check the /ready endpoint exposed by a local cloudflared instance.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<TunnelReadyArgs> =>
		yargs.option("metrics", {
			type: "string",
			demandOption: true,
			description: "Metrics server address for the cloudflared instance",
		}) as Argv<TunnelReadyArgs>,
	handler: async (argv: ArgumentsCamelCase<TunnelReadyArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels ready.");
		}
		const args = ["tunnel", "--metrics", argv.metrics, "ready"];
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
