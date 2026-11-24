import $export from "./export.js";
import $generate from "./generate.js";
/**
 * summaries command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "summaries",
	describe: "Summaries of historical RealtimeKit sessions",

	routes: {
		export: $export,
		generate: $generate,
	},
});

export default command;
