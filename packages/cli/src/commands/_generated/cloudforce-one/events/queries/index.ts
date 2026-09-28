import $createcreate from "./create-create.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get/index.js";
import $patch from "./patch.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * queries command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "queries",
	describe: "Operations for events.queries",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($createcreate)
			.command($delete)
			.command($patch)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
