import $auditlogs from "./audit-logs/index.js";
import $billing from "./billing/index.js";
import $edit from "./edit.js";
import $firewall from "./firewall/index.js";
import $get from "./get.js";
import $invites from "./invites/index.js";
import $loadbalancers from "./load-balancers/index.js";
import $loadbalancinganalytics from "./load-balancing-analytics/index.js";
import $memberships from "./memberships/index.js";
import $subscriptions from "./subscriptions/index.js";
import $tenants from "./tenants/index.js";
import $tokens from "./tokens/index.js";
/**
 * user command
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user",
	describe:
		"Your Cloudflare user profile, invitations, organizations, billing, and personal API tokens",

	routes: {
		edit: $edit,
		get: $get,
		"audit-logs": $auditlogs,
		billing: $billing,
		firewall: $firewall,
		invites: $invites,
		"load-balancers": $loadbalancers,
		"load-balancing-analytics": $loadbalancinganalytics,
		memberships: $memberships,
		subscriptions: $subscriptions,
		tenants: $tenants,
		tokens: $tokens,
	},
});

export default command;
