import $getbookmark from "./get-bookmark.js";
import $restore from "./restore.js";
/**
 * time-travel command group
 * @generated from apis/overlays/d1.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "time-travel",
	describe: "use specific point-in-time backups of your D1 database",

	routes: {
		"get-bookmark": $getbookmark,
		restore: $restore,
	},
});

export default command;
