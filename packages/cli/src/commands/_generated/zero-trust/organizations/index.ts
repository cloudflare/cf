import $create from "./create.js";
import $doh from "./doh/index.js";
import $list from "./list.js";
import $revokeusers from "./revoke-users.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organizations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organizations",
	describe: "Operations for organizations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.command($revokeusers)
			.command($update)
			.command($doh)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
