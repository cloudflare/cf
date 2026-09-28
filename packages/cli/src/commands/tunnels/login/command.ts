import { CliExit } from "../../../lib/cli-exit.js";
import { getComplianceRegion } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { CommandModule } from "yargs";

const command: CommandModule<object, CommonYargsOptions> = {
	command: "login",
	describe:
		"Authorize cloudflared and download an origin certificate for locally managed tunnels.",
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels login.");
		}
		const args = ["tunnel", "login"];
		const complianceRegion = await withCloudflareDotEnv(
			{ mode: argv.mode, local: argv.local },
			() => getComplianceRegion()
		);
		if (complianceRegion === "fedramp_high") {
			args.push("--fedramp");
		}
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
