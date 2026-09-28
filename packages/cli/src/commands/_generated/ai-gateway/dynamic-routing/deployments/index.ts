import $create from "./create.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * deployments command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "deployments",
	describe: "Deploy dynamic route versions and view deployment history",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
