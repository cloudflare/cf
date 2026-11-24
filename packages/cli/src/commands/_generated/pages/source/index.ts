import $connect from "./connect.js";
import $disconnect from "./disconnect.js";
/**
 * source command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "source",
	describe: "Operations for source",

	routes: {
		connect: $connect,
		disconnect: $disconnect,
	},
});

export default command;
