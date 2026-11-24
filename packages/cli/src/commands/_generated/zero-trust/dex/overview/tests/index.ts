import $list from "./list.js";
import $uniquedevices from "./unique-devices/index.js";
/**
 * tests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tests",
	describe: "Operations for dex.overview.tests",

	routes: {
		list: $list,
		"unique-devices": $uniquedevices,
	},
});

export default command;
