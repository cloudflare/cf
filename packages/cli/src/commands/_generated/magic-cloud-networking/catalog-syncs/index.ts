import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $prebuiltpolicies from "./prebuilt-policies/index.js";
import $refresh from "./refresh.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * catalog-syncs command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "catalog-syncs",
	describe: "Operations for catalog-syncs",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($refresh)
			.command($update)
			.command($prebuiltpolicies)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
