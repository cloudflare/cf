/** @generated from zone-lockdown-delete-a-zone-lockdown-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns/${request.lock_downs_id}`,
} as const;
