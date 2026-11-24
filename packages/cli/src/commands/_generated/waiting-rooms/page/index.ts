import $preview from "./preview.js";
/**
 * page command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "page",
	describe: "Custom HTML waiting page templates and preview rendering",

	routes: {
		preview: $preview,
	},
});

export default command;
