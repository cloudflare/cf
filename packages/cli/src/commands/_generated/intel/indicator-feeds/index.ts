import $create from "./create.js";
import $data from "./data.js";
import $downloads from "./downloads/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $permissions from "./permissions/index.js";
import $providers from "./providers/index.js";
import $snapshots from "./snapshots/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * indicator-feeds command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "indicator-feeds",
	describe:
		"Threat indicator feeds — subscribe to and manage curated lists of malicious IPs, domains, and URLs",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($data)
			.command($get)
			.command($list)
			.command($update)
			.command($downloads)
			.command($permissions)
			.command($providers)
			.command($snapshots)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
