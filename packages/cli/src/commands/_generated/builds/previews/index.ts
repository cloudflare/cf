import $createbuild from "./create-build.js";
import $get from "./get.js";
import $listbuilds from "./list-builds.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe:
		"Manage the Previews that Workers Builds creates for non-production branches.",

	builder: (yargs) => {
		return yargs
			.command($createbuild)
			.command($get)
			.command($list)
			.command($listbuilds)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
