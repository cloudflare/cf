import $create from "./create.js";
import $delete from "./delete.js";
import $discoverall from "./discover-all.js";
import $discover from "./discover.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $initialsetup from "./initial-setup.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cloud-integrations command group
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cloud-integrations",
	describe: "Operations for cloud-integrations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($discover)
			.command($discoverall)
			.command($edit)
			.command($get)
			.command($initialsetup)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
