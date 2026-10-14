/** @generated from firewall.waf.packages.groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/groups/${request.group_id}`,
} as const;
