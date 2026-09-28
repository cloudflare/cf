import $delete from "./delete.js";
import $replacetags from "./replace-tags.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk",
	describe: "Operations for access.targets.bulk",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($replacetags)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
