import { createCommandClient } from "../../../lib/auth.js";
import { CliExit } from "../../../lib/cli-exit.js";
import { getAccountId } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { withProgress } from "../../../lib/progress.js";
import { CLOUDFLARED_LOG_LEVELS, runCloudflared } from "../../cloudflared.js";
import { getTunnelToken, resolveTunnelId } from "./client.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface TunnelRunArgs extends CommonYargsOptions {
	tunnel?: string;
	token?: string;
	"log-level": (typeof CLOUDFLARED_LOG_LEVELS)[number];
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<TunnelRunArgs> {
	return yargs
		.positional("tunnel", {
			type: "string",
			description: "Tunnel name or UUID; required unless --token is provided",
		})
		.option("token", {
			type: "string",
			description: "Tunnel token supplied directly to cloudflared",
		})
		.option("log-level", {
			type: "string",
			choices: CLOUDFLARED_LOG_LEVELS,
			default: "info" as const,
			description: "cloudflared log level",
		}) as Argv<TunnelRunArgs>;
}

const command: CommandModule<CommonYargsOptions, TunnelRunArgs> = {
	command: "run [tunnel]",
	describe:
		"Run a named Cloudflare Tunnel using the cf-managed cloudflared binary.",
	builder,
	handler: async (argv: ArgumentsCamelCase<TunnelRunArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels run.");
		}

		let token = argv.token;
		const tunnel = argv.tunnel;
		if (!token) {
			if (!tunnel) {
				throw new Error(
					"Either a tunnel name/UUID or --token must be provided."
				);
			}
			token = await withCloudflareDotEnv(argv, async () => {
				const client = await createCommandClient(argv);
				const accountId = await getAccountId();
				return withProgress("Fetching tunnel token", async () => {
					const tunnelId = await resolveTunnelId(client, accountId, tunnel);
					return getTunnelToken(client, accountId, tunnelId);
				});
			});
		}

		const args = ["tunnel", "--loglevel", argv["log-level"]];
		args.push("run");

		throw new CliExit(
			await runCloudflared(args, { env: { TUNNEL_TOKEN: token } })
		);
	},
};

export default command;
