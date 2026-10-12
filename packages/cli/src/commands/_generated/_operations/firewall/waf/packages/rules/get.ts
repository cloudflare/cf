/** @generated from firewall.waf.packages.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/rules/${request.rule_id}`,
} as const;
