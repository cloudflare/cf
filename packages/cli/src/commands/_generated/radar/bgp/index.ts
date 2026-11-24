import $hijacks from "./hijacks/index.js";
import $ips from "./ips/index.js";
import $leaks from "./leaks/index.js";
import $routes from "./routes/index.js";
import $rpki from "./rpki/index.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
/**
 * bgp command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bgp",
	describe:
		"BGP routing data — prefix announcements, AS-level stats, route leaks, and hijack events",

	routes: {
		timeseries: $timeseries,
		hijacks: $hijacks,
		ips: $ips,
		leaks: $leaks,
		routes: $routes,
		rpki: $rpki,
		top: $top,
	},
});

export default command;
