import $search from "./search.js";
/**
 * scripts command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scripts",
	describe:
		"Worker script operations including usage model, settings, content, tags, schedules, subdomains, and queue consumers",

	routes: {
		search: $search,
	},
});

export default command;
