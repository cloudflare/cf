import $bulkapply from "./bulk-apply.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $export from "./export.js";
import $get from "./get.js";
import $import from "./import.js";
import $list from "./list.js";
import $scanlist from "./scan-list.js";
import $scanreview from "./scan-review.js";
import $scantrigger from "./scan-trigger.js";
import $scan from "./scan.js";
import $update from "./update.js";
/**
 * records command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "records",
	describe: "Operations for records",

	routes: {
		"bulk-apply": $bulkapply,
		create: $create,
		delete: $delete,
		edit: $edit,
		export: $export,
		get: $get,
		import: $import,
		list: $list,
		scan: $scan,
		"scan-list": $scanlist,
		"scan-review": $scanreview,
		"scan-trigger": $scantrigger,
		update: $update,
	},
});

export default command;
