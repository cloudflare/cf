import $applications from "./applications/index.js";
import $billing from "./billing/index.js";
import $categories from "./categories/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $entitlements from "./entitlements/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $members from "./members/index.js";
import $move from "./move.js";
import $organizations from "./organizations/index.js";
import $profile from "./profile/index.js";
import $subscriptions from "./subscriptions/index.js";
import $tokens from "./tokens/index.js";
import $transformations from "./transformations/index.js";
import $update from "./update.js";
import $utbilling from "./ut-billing/index.js";
/**
 * accounts command
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "accounts",
	describe:
		"Account settings, members, roles, subscriptions, and API tokens for your Cloudflare account",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		move: $move,
		update: $update,
		applications: $applications,
		billing: $billing,
		categories: $categories,
		entitlements: $entitlements,
		logs: $logs,
		members: $members,
		organizations: $organizations,
		profile: $profile,
		subscriptions: $subscriptions,
		tokens: $tokens,
		transformations: $transformations,
		"ut-billing": $utbilling,
	},
});

export default command;
