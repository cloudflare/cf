/** @generated from firewall.waf.packages.groups.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/groups/${request.group_id}`,
	body: "json",
} as const;
