import { CliExit } from "../../../lib/cli-exit.js";
import { CLOUDFLARED_LOG_LEVELS, runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface TunnelQuickStartArgs extends CommonYargsOptions {
	url: string;
	"log-level": (typeof CLOUDFLARED_LOG_LEVELS)[number];
}

const command: CommandModule<CommonYargsOptions, TunnelQuickStartArgs> = {
	command: "quick-start <url>",
	describe:
		"Expose a local URL with a temporary trycloudflare.com tunnel. The tunnel remains active until cf exits.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<TunnelQuickStartArgs> =>
		yargs
			.positional("url", {
				type: "string",
				description: "Local URL to expose (for example, http://localhost:3000)",
				demandOption: true,
			})
			.option("log-level", {
				type: "string",
				choices: CLOUDFLARED_LOG_LEVELS,
				default: "info" as const,
				description: "cloudflared log level",
			}) as Argv<TunnelQuickStartArgs>,
	handler: async (
		argv: ArgumentsCamelCase<TunnelQuickStartArgs>
	): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels quick-start.");
		}
		throw new CliExit(
			await runCloudflared([
				"tunnel",
				"--url",
				argv.url,
				"--loglevel",
				argv["log-level"],
			])
		);
	},
};

export default command;
