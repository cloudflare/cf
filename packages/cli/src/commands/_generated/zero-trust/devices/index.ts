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
import $registrations from "./registrations/index.js";
import $settings from "./settings/index.js";
import $update from "./update.js";
/**
 * devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "devices",
	describe: "Operations for devices",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"client-versions": $clientversions,
		"deployment-groups": $deploymentgroups,
		"emergency-disconnect": $emergencydisconnect,
		"ip-profiles": $ipprofiles,
		networks: $networks,
		"override-codes": $overridecodes,
		posture: $posture,
		registrations: $registrations,
		settings: $settings,
	},
});

export default command;
