import $accounts from "./accounts/index.js";
import $billing from "./billing/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $invites from "./invites/index.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $members from "./members/index.js";
import $profile from "./profile/index.js";
import $shares from "./shares/index.js";
import $update from "./update.js";
/**
 * organizations command
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "organizations",
	describe:
		"Multi-user organizations that group accounts, members, and shared settings under a single entity",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		accounts: $accounts,
		billing: $billing,
		invites: $invites,
		logs: $logs,
		members: $members,
		profile: $profile,
		shares: $shares,
	},
});

export default command;
