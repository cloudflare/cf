import $changes from "./changes.js";
import $snapshot from "./snapshot.js";
import $timeseries from "./timeseries.js";
/**
 * aspa command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "aspa",
	describe: "Operations for bgp.rpki.aspa",

	routes: {
		changes: $changes,
		snapshot: $snapshot,
		timeseries: $timeseries,
	},
});

export default command;
