import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * crawl command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "crawl",
	describe: "Operations for crawl",

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
