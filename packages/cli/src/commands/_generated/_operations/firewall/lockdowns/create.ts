/** @generated from firewall.lockdowns.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns`,
	body: "json",
} as const;
