import $create from "./create.js";
/**
 * polls command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "polls",
	describe: "Polls for active meeting sessions",

	routes: {
		create: $create,
	},
});

export default command;
