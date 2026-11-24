import $sql from "./sql/index.js";
/**
 * analytics-engine command
 * @generated from apis/overlays/analytics-engine.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analytics-engine",
	describe: "analytics-engine",

	routes: {
		sql: $sql,
	},
});

export default command;
