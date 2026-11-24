import $routes from "./routes/index.js";
import $subnets from "./subnets/index.js";
import $virtualnetworks from "./virtual-networks/index.js";
/**
 * network command
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "network",
	describe: "network",

	routes: {
		routes: $routes,
		subnets: $subnets,
		"virtual-networks": $virtualnetworks,
	},
});

export default command;
