import $bytimes from "./bytimes/index.js";
import $summaries from "./summaries/index.js";
/**
 * events command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Operations for analytics.events",

	routes: {
		bytimes: $bytimes,
		summaries: $summaries,
	},
});

export default command;
