import { CliExit } from "../../../lib/cli-exit.js";
import { getComplianceRegion } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface AccessTokenArgs extends CommonYargsOptions {
	url: string;
}

const command: CommandModule<CommonYargsOptions, AccessTokenArgs> = {
	command: "token <url>",
	describe: "Print a JWT for authenticating with an Access application.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<AccessTokenArgs> =>
		yargs.positional("url", {
			type: "string",
			description: "URL of the Access application",
			demandOption: true,
		}) as Argv<AccessTokenArgs>,
	handler: async (argv: ArgumentsCamelCase<AccessTokenArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf access token.");
		}
		const args = ["access"];
		const complianceRegion = await withCloudflareDotEnv(
			{ mode: argv.mode, local: argv.local },
			() => getComplianceRegion()
		);
		if (complianceRegion === "fedramp_high") {
			args.push("--fedramp");
		}
		args.push("token", argv.url);
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
