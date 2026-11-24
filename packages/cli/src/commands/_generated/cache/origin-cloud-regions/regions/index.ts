import $listsupported from "./list-supported.js";
/**
 * regions command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regions",
	describe: "Operations for origin-cloud-regions.regions",

	routes: {
		"list-supported": $listsupported,
	},
});

export default command;
