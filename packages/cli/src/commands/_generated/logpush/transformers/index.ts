import $content from "./content/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $preview from "./preview.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * transformers command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "transformers",
	describe: "Operations for transformers",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($preview)
			.command($update)
			.command($content)
			.command($versions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
