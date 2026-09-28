import { CliExit } from "../../../lib/cli-exit.js";
import { getComplianceRegion } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface AccessLoginArgs extends CommonYargsOptions {
	url: string;
}

const command: CommandModule<CommonYargsOptions, AccessLoginArgs> = {
	command: "login <url>",
	describe:
		"Authenticate with an Access application and store its JWT through cloudflared.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<AccessLoginArgs> =>
		yargs.positional("url", {
			type: "string",
			description: "URL of the Access application",
			demandOption: true,
		}) as Argv<AccessLoginArgs>,
	handler: async (argv: ArgumentsCamelCase<AccessLoginArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf access login.");
		}
		const args = ["access"];
		const complianceRegion = await withCloudflareDotEnv(
			{ mode: argv.mode, local: argv.local },
			() => getComplianceRegion()
		);
		if (complianceRegion === "fedramp_high") {
			args.push("--fedramp");
		}
		args.push("login");
		if (argv.quiet) {
			args.push("--quiet");
		}
		args.push(argv.url);
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
