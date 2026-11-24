import $account from "./account/index.js";
import $monitorgroups from "./monitor-groups/index.js";
import $monitors from "./monitors/index.js";
import $pools from "./pools/index.js";
import $previews from "./previews/index.js";
import $regions from "./regions/index.js";
import $searches from "./searches/index.js";
/**
 * load-balancers command
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "load-balancers",
	describe:
		"Distribute traffic across origin pools with health monitoring, geo-steering, and failover",

	routes: {
		account: $account,
		"monitor-groups": $monitorgroups,
		monitors: $monitors,
		pools: $pools,
		previews: $previews,
		regions: $regions,
		searches: $searches,
	},
});

export default command;
