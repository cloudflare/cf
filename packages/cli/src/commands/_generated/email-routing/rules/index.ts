import $catchall from "./catch-all/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $listaccount from "./list-account.js";
import $plan from "./plan.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe:
		"Match incoming email addresses and forward messages to destination mailboxes or Workers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		"list-account": $listaccount,
		plan: $plan,
		update: $update,
		"catch-all": $catchall,
	},
});

export default command;
