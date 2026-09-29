import $create from "./create.js";
import $doh from "./doh/index.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organization command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organization",
	describe: "Operations for organization",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($update)
			.command($doh)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
