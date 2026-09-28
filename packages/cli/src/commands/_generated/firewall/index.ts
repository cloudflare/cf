import $accessrules from "./access-rules/index.js";
import $lockdowns from "./lockdowns/index.js";
import $uarules from "./ua-rules/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * firewall command
 * @generated from apis/overlays/firewall.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "firewall",
	describe:
		"Legacy firewall rules, zone lockdowns, access rules, user-agent blocking, and WAF packages",

	builder: (yargs) => {
		return yargs
			.command($accessrules)
			.command($lockdowns)
			.command($uarules)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
