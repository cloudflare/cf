import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get/index.js";
import $members from "./members/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * groups command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "groups",
	describe: "Operations for events.dataset.groups",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($update)
			.command($get)
			.command($members)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
