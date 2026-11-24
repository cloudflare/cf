import $apptypes from "./app-types/index.js";
import $categories from "./categories/index.js";
import $certificates from "./certificates/index.js";
import $configurations from "./configurations/index.js";
import $create from "./create.js";
import $dnsdestinationips from "./dns-destination-ips/index.js";
import $list from "./list.js";
import $lists from "./lists/index.js";
import $locations from "./locations/index.js";
import $logging from "./logging/index.js";
import $pacfiles from "./pacfiles/index.js";
import $proxyendpoints from "./proxy-endpoints/index.js";
import $rules from "./rules/index.js";
/**
 * gateway command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "gateway",
	describe: "Operations for gateway",

	routes: {
		create: $create,
		list: $list,
		"app-types": $apptypes,
		categories: $categories,
		certificates: $certificates,
		configurations: $configurations,
		"dns-destination-ips": $dnsdestinationips,
		lists: $lists,
		locations: $locations,
		logging: $logging,
		pacfiles: $pacfiles,
		"proxy-endpoints": $proxyendpoints,
		rules: $rules,
	},
});

export default command;
