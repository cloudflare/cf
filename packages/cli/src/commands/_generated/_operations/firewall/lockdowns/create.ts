/** @generated from zone-lockdown-create-a-zone-lockdown-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns`,
	body: "json",
} as const;
