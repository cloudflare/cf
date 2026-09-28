import { CliExit } from "../../../lib/cli-exit.js";
import { getComplianceRegion } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface AccessSshGenArgs extends CommonYargsOptions {
	hostname: string;
}

const command: CommandModule<CommonYargsOptions, AccessSshGenArgs> = {
	command: "ssh-gen",
	describe: "Generate a short-lived certificate for an Access SSH application.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<AccessSshGenArgs> =>
		yargs.option("hostname", {
			type: "string",
			description: "Hostname of the Access application",
			demandOption: true,
		}) as Argv<AccessSshGenArgs>,
	handler: async (
		argv: ArgumentsCamelCase<AccessSshGenArgs>
	): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf access ssh-gen.");
		}
		const args = ["access"];
		const complianceRegion = await withCloudflareDotEnv(
			{ mode: argv.mode, local: argv.local },
			() => getComplianceRegion()
		);
		if (complianceRegion === "fedramp_high") {
			args.push("--fedramp");
		}
		args.push("ssh-gen", "--hostname", argv.hostname);
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
