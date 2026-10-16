import $accountresources from "./account-resources/index.js";
import $keys from "./keys/index.js";
import $resources from "./resources/index.js";
import $summary from "./summary/index.js";
import $values from "./values/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command
 * @generated from apis/overlays/tags.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "tags",

	builder: (yargs) => {
		return yargs
			.command($accountresources)
			.command($keys)
			.command($resources)
			.command($summary)
			.command($values)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
