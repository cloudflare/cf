import $origin from "./origin.js";
import $target from "./target.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locations",
	describe: "Operations for attacks.layer3.top.locations",

	routes: {
		origin: $origin,
		target: $target,
	},
});

export default command;
