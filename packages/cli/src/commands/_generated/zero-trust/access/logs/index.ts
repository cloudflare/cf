import $accessrequests from "./access-requests/index.js";
import $jitrequests from "./jit-requests/index.js";
import $scim from "./scim/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe: "Operations for access.logs",

	builder: (yargs) => {
		return yargs
			.command($accessrequests)
			.command($jitrequests)
			.command($scim)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
