import $approvals from "./approvals/index.js";
import $create from "./create.js";
import $deleteall from "./delete-all.js";
import $delete from "./delete.js";
import $email from "./email/index.js";
import $exemptions from "./exemptions/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $managed from "./managed/index.js";
import $search from "./search.js";
import $stats from "./stats/index.js";
import $tree from "./tree/index.js";
import $update from "./update.js";
import $validate from "./validate.js";
/**
 * rules command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Rule management operations",

	routes: {
		create: $create,
		delete: $delete,
		"delete-all": $deleteall,
		get: $get,
		list: $list,
		search: $search,
		update: $update,
		validate: $validate,
		approvals: $approvals,
		email: $email,
		exemptions: $exemptions,
		managed: $managed,
		stats: $stats,
		tree: $tree,
	},
});

export default command;
