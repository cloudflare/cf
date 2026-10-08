import $create from "./create.js";
import $legacy from "./legacy/index.js";
import $list from "./list.js";
import $quota from "./quota.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * priority command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "priority",
	describe: "Operations for requests.v1.priority",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.command($quota)
			.command($legacy)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
