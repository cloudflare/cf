import $cidr from "./cidr/index.js";
import $hostname from "./hostname/index.js";
import $resolve from "./resolve.js";
/**
 * routes command group
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "routes",
	describe: "Operations for routes",

	routes: {
		resolve: $resolve,
		cidr: $cidr,
		hostname: $hostname,
	},
});

export default command;
