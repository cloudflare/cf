import { CliExit } from "../../../lib/cli-exit.js";
import { getComplianceRegion } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface AccessCurlArgs extends CommonYargsOptions {
	url: string;
	"allow-request"?: boolean;
	"--"?: (string | number)[];
}

const command: CommandModule<CommonYargsOptions, AccessCurlArgs> = {
	command: "curl <url>",
	describe:
		"Run curl against an Access-protected application with its JWT injected by cloudflared.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<AccessCurlArgs> =>
		yargs
			.parserConfiguration({
				"populate--": true,
				"parse-positional-numbers": false,
				"short-option-groups": false,
			})
			.option("allow-request", {
				alias: "ar",
				type: "boolean",
				description: "Continue the request when no Access token is available",
			})
			.positional("url", {
				type: "string",
				description: "URL of the Access application",
				demandOption: true,
			}) as Argv<AccessCurlArgs>,
	handler: async (argv: ArgumentsCamelCase<AccessCurlArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf access curl.");
		}
		const args = ["access"];
		const complianceRegion = await withCloudflareDotEnv(
			{ mode: argv.mode, local: argv.local },
			() => getComplianceRegion()
		);
		if (complianceRegion === "fedramp_high") {
			args.push("--fedramp");
		}
		args.push("curl");
		if (argv["allow-request"]) {
			args.push("--allow-request");
		}
		args.push(argv.url, ...(argv["--"] ?? []).map(String));
		throw new CliExit(await runCloudflared(args));
	},
};

export default command;
