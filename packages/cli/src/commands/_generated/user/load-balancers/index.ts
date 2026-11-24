import $monitors from "./monitors/index.js";
import $pools from "./pools/index.js";
import $preview from "./preview/index.js";
import $regions from "./regions/index.js";
/**
 * load-balancers command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "load-balancers",
	describe: "Operations for load-balancers",

	routes: {
		monitors: $monitors,
		pools: $pools,
		preview: $preview,
		regions: $regions,
	},
});

export default command;
