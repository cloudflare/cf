/** @generated from firewall.waf.packages.rules.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/rules/${request.rule_id}`,
	body: "json",
} as const;
