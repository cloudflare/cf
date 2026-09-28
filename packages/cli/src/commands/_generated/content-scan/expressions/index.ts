import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * expressions command group
 * @generated from apis/overlays/content-scan.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "expressions",
	describe:
		"Custom expressions that tell the scanner how to reach content objects it cannot parse on its own",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
