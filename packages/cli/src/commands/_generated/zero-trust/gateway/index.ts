import $apptypes from "./app-types/index.js";
import $categories from "./categories/index.js";
import $certificates from "./certificates/index.js";
import $configurations from "./configurations/index.js";
import $create from "./create.js";
import $dnsdestinationips from "./dns-destination-ips/index.js";
import $egresscidrpairs from "./egress-cidr-pairs/index.js";
import $list from "./list.js";
import $lists from "./lists/index.js";
import $locations from "./locations/index.js";
import $logging from "./logging/index.js";
import $operations from "./operations/index.js";
import $pacfiles from "./pacfiles/index.js";
import $proxyendpoints from "./proxy-endpoints/index.js";
import $rules from "./rules/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * gateway command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "gateway",
	describe: "Operations for gateway",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.command($apptypes)
			.command($categories)
			.command($certificates)
			.command($configurations)
			.command($dnsdestinationips)
			.command($egresscidrpairs)
			.command($lists)
			.command($locations)
			.command($logging)
			.command($operations)
			.command($pacfiles)
			.command($proxyendpoints)
			.command($rules)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
