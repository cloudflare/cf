/** @generated from hostnames.settings.tls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hostnames/settings/${request.setting_id}`,
} as const;
