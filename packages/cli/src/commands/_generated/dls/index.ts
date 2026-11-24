import $regionalservices from "./regional-services/index.js";
import $regions from "./regions/index.js";
/**
 * dls command
 * @generated from apis/overlays/dls.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dls",
	describe: "dls",

	routes: {
		"regional-services": $regionalservices,
		regions: $regions,
	},
});

export default command;
