import $clientversions from "./client-versions/index.js";
import $delete from "./delete.js";
import $deploymentgroups from "./deployment-groups/index.js";
import $emergencydisconnect from "./emergency-disconnect/index.js";
import $get from "./get.js";
import $ipprofiles from "./ip-profiles/index.js";
import $list from "./list.js";
import $networks from "./networks/index.js";
import $overridecodes from "./override-codes/index.js";
import $posture from "./posture/index.js";
import $profiles from "./profiles/index.js";
import $registrations from "./registrations/index.js";
import $settings from "./settings/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "devices",
	describe: "Operations for devices",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($clientversions)
			.command($deploymentgroups)
			.command($emergencydisconnect)
			.command($ipprofiles)
			.command($networks)
			.command($overridecodes)
			.command($posture)
			.command($profiles)
			.command($registrations)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
