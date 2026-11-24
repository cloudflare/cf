import $list from "./list.js";
/**
 * availabilities command group
 * @generated from apis/overlays/speed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "availabilities",
	describe:
		"Check which speed test regions and configurations are available for your zone",

	routes: {
		list: $list,
	},
});

export default command;
