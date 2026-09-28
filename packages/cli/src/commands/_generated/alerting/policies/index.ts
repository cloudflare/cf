import $create from "./create.js";
import $delete from "./delete.js";
import $email from "./email/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $test from "./test.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * policies command group
 * @generated from apis/overlays/alerting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "policies",
	describe: "Operations for policies",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($test)
			.command($update)
			.command($email)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
