import $countzonesenabledforaccount from "./count-zones-enabled-for-account.js";
import $countzonesenabledforuser from "./count-zones-enabled-for-user.js";
import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * smart-routing command group
 * @generated from apis/overlays/argo.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "smart-routing",
	describe:
		"Route traffic through the fastest network paths to your origin using real-time latency data",

	builder: (yargs) => {
		return yargs
			.command($countzonesenabledforaccount)
			.command($countzonesenabledforuser)
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
