/** @generated from zone-lockdown-get-a-zone-lockdown-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns/${request.lock_downs_id}`,
} as const;
