import $ases from "./ases.js";
import $moas from "./moas.js";
import $paths from "./paths/index.js";
import $pfx2as from "./pfx2as.js";
import $realtime from "./realtime.js";
import $stats from "./stats.js";
import $upstreams from "./upstreams/index.js";
/**
 * routes command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "routes",
	describe: "Operations for bgp.routes",

	routes: {
		ases: $ases,
		moas: $moas,
		pfx2as: $pfx2as,
		realtime: $realtime,
		stats: $stats,
		paths: $paths,
		upstreams: $upstreams,
	},
});

export default command;
