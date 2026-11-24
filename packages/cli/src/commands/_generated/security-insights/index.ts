import $auditlogs from "./audit-logs/index.js";
import $classify from "./classify.js";
import $context from "./context/index.js";
import $count from "./count/index.js";
import $dismiss from "./dismiss.js";
import $list from "./list.js";
import $partners from "./partners/index.js";
import $scans from "./scans/index.js";
import $state from "./state/index.js";
/**
 * security-insights command
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "security-insights",
	describe: "security-insights",

	routes: {
		classify: $classify,
		dismiss: $dismiss,
		list: $list,
		"audit-logs": $auditlogs,
		context: $context,
		count: $count,
		partners: $partners,
		scans: $scans,
		state: $state,
	},
});

export default command;
