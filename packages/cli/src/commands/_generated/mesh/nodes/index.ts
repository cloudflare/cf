import $configurations from "./configurations/index.js";
import $connections from "./connections/index.js";
import $connectors from "./connectors/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $failover from "./failover.js";
import $get from "./get.js";
import $list from "./list.js";
import $token from "./token/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * nodes command group
 * @generated from apis/overlays/mesh.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "nodes",
	describe: "Operations for nodes",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($failover)
			.command($get)
			.command($list)
			.command($configurations)
			.command($connections)
			.command($connectors)
			.command($token)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
