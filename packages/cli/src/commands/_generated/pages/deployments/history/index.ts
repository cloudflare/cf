import $logs from "./logs/index.js";
/**
 * history command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "history",
	describe: "Operations for deployments.history",

	routes: {
		logs: $logs,
	},
});

export default command;
