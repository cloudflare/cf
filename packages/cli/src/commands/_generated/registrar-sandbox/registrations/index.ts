import $check from "./check.js";
import $create from "./create.js";
import $getregistrationstatus from "./get-registration-status.js";
import $getupdatestatus from "./get-update-status.js";
import $get from "./get.js";
import $list from "./list.js";
import $search from "./search.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * registrations command group
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "registrations",
	describe: "Operations for registrations",

	builder: (yargs) => {
		return yargs
			.command($check)
			.command($create)
			.command($get)
			.command($getregistrationstatus)
			.command($getupdatestatus)
			.command($list)
			.command($search)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
