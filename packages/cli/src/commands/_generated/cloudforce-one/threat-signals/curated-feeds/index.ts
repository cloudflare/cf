import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $optout from "./opt-out.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * curated-feeds command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "curated-feeds",
	describe: "Operations for threat-signals.curated-feeds",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($create)
			.command($delete)
			.command($list)
			.command($optout)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
