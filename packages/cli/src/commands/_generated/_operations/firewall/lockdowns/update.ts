/** @generated from zone-lockdown-update-a-zone-lockdown-rule */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns/${request.lock_downs_id}`,
	body: "json",
} as const;
