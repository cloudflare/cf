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
import $tenant from "./tenant/index.js";
import $tokens from "./tokens/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user command
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user",
	describe:
		"Your Cloudflare user profile, invitations, organizations, billing, and personal API tokens",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.command($auditlogs)
			.command($billing)
			.command($firewall)
			.command($invites)
			.command($loadbalancers)
			.command($loadbalancinganalytics)
			.command($memberships)
			.command($subscriptions)
			.command($tenant)
			.command($tokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
