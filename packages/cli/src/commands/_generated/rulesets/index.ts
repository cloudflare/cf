import $create from "./create.js";
import $delete from "./delete.js";
import $entrypoint from "./entrypoint/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $rules from "./rules/index.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rulesets command
 * @generated from apis/overlays/rulesets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rulesets",
	describe: "rulesets",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($entrypoint)
			.command($rules)
			.command($versions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
