import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command group
 * @generated from apis/overlays/healthchecks.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe:
		"Test a health check configuration before deploying it to production",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
