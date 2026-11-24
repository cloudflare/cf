import $create from "./create.js";
import $list from "./list.js";
/**
 * submissions command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "submissions",
	describe:
		"Reclassify submissions — track user and team reports of false positives and missed detections",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
