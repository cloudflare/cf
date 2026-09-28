import $add from "./add.js";
import $generate from "./generate.js";
import $remove from "./remove.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "Operations for threat-signals.articles.tags",

	builder: (yargs) => {
		return yargs
			.command($add)
			.command($generate)
			.command($remove)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
