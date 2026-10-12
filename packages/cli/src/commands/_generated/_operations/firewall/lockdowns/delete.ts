/** @generated from firewall.lockdowns.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns/${request.lock_downs_id}`,
} as const;
