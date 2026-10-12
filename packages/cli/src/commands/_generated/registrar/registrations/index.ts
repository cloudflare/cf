import $check from "./check.js";
import $getregistrationstatus from "./get-registration-status.js";
import $gettransferstatus from "./get-transfer-status.js";
import $getupdatestatus from "./get-update-status.js";
import $get from "./get.js";
import $list from "./list.js";
import $search from "./search.js";
import $transfercheck from "./transfer-check.js";
import $transferin from "./transfer-in.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * registrations command group
 * @generated from apis/overlays/registrar.ts
 */
import type { CommandModule } from "yargs";
import $create from "#commands/registrar/registrations/create/index.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "registrations",
	describe: "Operations for registrations",

	builder: (yargs) => {
		return yargs
			.command($check)
			.command($create)
			.command($get)
			.command($getregistrationstatus)
			.command($gettransferstatus)
			.command($getupdatestatus)
			.command($list)
			.command($search)
			.command($transfercheck)
			.command($transferin)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
