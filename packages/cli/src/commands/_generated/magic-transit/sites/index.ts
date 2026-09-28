import $acls from "./acls/index.js";
import $appconfiguration from "./app-configuration/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $lans from "./lans/index.js";
import $list from "./list.js";
import $netflowconfig from "./netflow-config/index.js";
import $update from "./update.js";
import $wans from "./wans/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sites command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sites",
	describe:
		"Magic WAN branch sites — base CRUD, LAN/WAN interface configuration, ACLs, connectors, app configuration, and NetFlow config",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($acls)
			.command($appconfiguration)
			.command($lans)
			.command($netflowconfig)
			.command($wans)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
