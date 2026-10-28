import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * payload-logging command group
 * @generated from apis/overlays/firewall.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "payload-logging",
	describe:
		"Account-level public key that WAF payload logging uses to encrypt matched payloads",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
