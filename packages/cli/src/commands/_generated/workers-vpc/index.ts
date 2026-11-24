import $services from "./services/index.js";
/**
 * workers-vpc command
 * @generated from apis/overlays/workers-vpc.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "workers-vpc",
	describe: "workers-vpc",

	routes: {
		services: $services,
	},
});

export default command;
