import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $hosts from "./hosts/index.js";
import $list from "./list.js";
import $operations from "./operations/index.js";
import $setvalidation from "./set-validation.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * schemas command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "schemas",
	describe: "Operations for schema-validation.schemas",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($setvalidation)
			.command($hosts)
			.command($operations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
