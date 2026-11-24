import $purge from "./purge.js";
/**
 * build-cache command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "build-cache",
	describe: "Operations for build-cache",

	routes: {
		purge: $purge,
	},
});

export default command;
