/** @generated from firewall.access-rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules`,
	body: "json",
} as const;
