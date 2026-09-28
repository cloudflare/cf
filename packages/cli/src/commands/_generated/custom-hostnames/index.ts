import $certificatepack from "./certificate-pack/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $fallbackorigin from "./fallback-origin/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $quota from "./quota/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom-hostnames command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom-hostnames",
	describe: "custom-hostnames",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($certificatepack)
			.command($fallbackorigin)
			.command($quota)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
