import $add from "./add.js";
import $automations from "./automations/index.js";
import $get from "./get.js";
import $group from "./group.js";
import $list from "./list.js";
import $notify from "./notify.js";
import $occurrences from "./occurrences.js";
import $remove from "./remove.js";
import $summary from "./summary.js";
import $ungroup from "./ungroup.js";
import $update from "./update.js";
/**
 * issues command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "issues",
	describe: "Operations for issues",

	routes: {
		add: $add,
		get: $get,
		group: $group,
		list: $list,
		notify: $notify,
		occurrences: $occurrences,
		remove: $remove,
		summary: $summary,
		ungroup: $ungroup,
		update: $update,
		automations: $automations,
	},
});

export default command;
