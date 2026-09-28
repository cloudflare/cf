import $createbuild from "./create-build.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $listbuilds from "./list-builds.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command group
 * @generated from apis/overlays/workers-builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe: "Operations for workers.previews",

	builder: (yargs) => {
		return yargs
			.command($createbuild)
			.command($edit)
			.command($get)
			.command($list)
			.command($listbuilds)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
